import { parseBufferToTxs } from '@nimbus/csv-core';
import { categorizeBatch } from '@nimbus/categorize';
import { insertUpload, insertTransactions } from '@/lib/db';
import { ENTITLEMENTS } from '@/lib/entitlements';
// import { enqueueNdjson } from '@/lib/queue';
import { saveLastUpload } from '@/lib/state';
import fs from 'node:fs';
import path from 'node:path';

// --- helpers ---------------------------------------------------------------

// robust DE/EU amount parser: "−1.234,56 €", "-1 234,56", "1.234,56", ",50", "(1.234,56)"
function toNumberDE(v: unknown): number {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  if (typeof v !== 'string') return 0;

  let s = v.trim();
  if (!s) return 0;

  // normalize whitespace & currency junk
  s = s.replace(/\s+/g, '');
  // unicode minus → ASCII minus
  s = s.replace(/\u2212/g, '-');
  // strip currency symbols and letters
  s = s.replace(/[€A-Za-z]/g, '');

  // parenthesis for negatives: (1.234,56) → -1.234,56
  const neg = /^\(.*\)$/.test(s);
  if (neg) s = s.slice(1, -1);

  // last comma is decimal; dots are thousands
  const lastComma = s.lastIndexOf(',');
  if (lastComma !== -1) {
    s = s.replace(/\./g, '');
    s = s.slice(0, lastComma).replace(/,/g, '') + '.' + s.slice(lastComma + 1);
  } else {
    const dots = (s.match(/\./g) || []).length;
    if (dots > 1) s = s.replace(/\./g, '');
  }

  s = s.replace(/^-?\./, (m) => (m.startsWith('-') ? '-0.' : '0.'));

  const n = Number(s);
  return Number.isFinite(n) ? (neg ? -n : n) : 0;
}

// extract an amount from “Buchungstext” fallbacks, preferring EUR
// examples it handles:
//  - "Originalbetrag: 20,00 USD ..."
//  - "Karten­zahlung ... 12,34 EUR Ref ..."
//  - "... Betrag 1.234,56 ..."
function deriveAmountFromText(text: string): number | null {
  if (!text) return null;
  const t = text.replace(/\u00A0/g, ' '); // NBSP → space

  // 1) explicit EUR amount
  const eur = t.match(/(-?[\d.\s]+,\d{2})\s*(?:EUR|€)/i);
  if (eur) {
    const n = toNumberDE(eur[1]);
    if (n !== 0) return n;
  }

  // 2) last DE-style number in the string (common in card lines)
  const nums = [...t.matchAll(/-?[\d.\s]+,\d{2}/g)];
  if (nums.length) {
    const last = nums[nums.length - 1];
    if (last) {
      const n = toNumberDE(last[0]);
      if (n !== 0) return n;
    }
  }

  // 3) plain int amount (rare), use last one
  const ints = [...t.matchAll(/-?\d{1,6}(?:\.\d{3})*/g)];
  if (ints.length) {
    const lastInt = ints[ints.length - 1];
    if (lastInt) {
      const n = toNumberDE(lastInt[0] + ',00');
      if (n !== 0) return n;
    }
  }

  return null;
}

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const buf = Buffer.from(await req.arrayBuffer());

    const tier = (req.headers.get('x-demo-tier') || 'free') as keyof typeof ENTITLEMENTS;
    const caps = ENTITLEMENTS[tier]?.upload || ENTITLEMENTS.free.upload;
    const sizeMB = buf.byteLength / (1024 * 1024);
    const warnings: string[] = [];
    if (sizeMB > caps.maxSizeMB) {
      warnings.push(`File size ${sizeMB.toFixed(1)}MB exceeds cap ${caps.maxSizeMB}MB`);
    }

    const parsed = parseBufferToTxs(buf); // { txs, warnings, diagnostics, quarantined_rows? }
    // write a raw snapshot of the first 8 parsed tx objects (truncated) for debugging
    try {
      const dbgDir = path.join(process.cwd(), '.data');
      if (!fs.existsSync(dbgDir)) fs.mkdirSync(dbgDir, { recursive: true });
      const rawSample = (parsed.txs || []).slice(0, 8).map((t: any) => {
        const obj: any = {};
        Object.keys(t).slice(0, 40).forEach(k => obj[k] = String((t as any)[k]).slice(0, 200));
        return obj;
      });
      const keySet = new Set<string>();
      for (const t of (parsed.txs || []).slice(0, 50)) for (const k of Object.keys(t)) keySet.add(k);
      fs.writeFileSync(path.join(dbgDir, 'last-parsed.json'), JSON.stringify({
        keys: Array.from(keySet).sort(),
        sample: rawSample
      }, null, 2), 'utf8');
    } catch {/* ignore */}
    warnings.push(...(parsed.warnings ?? []));

    // Normalize inputs and derive amount if parser didn’t provide a numeric one
    const pre = parsed.txs.map((t: any) => {
      const ref = t.reference_raw ?? t.reference ?? t.description ?? t.memo ?? '';
      const amtFromCsv = toNumberDE(t.amount);
      const amt = amtFromCsv !== 0 ? amtFromCsv : (deriveAmountFromText(ref) ?? 0);

      return {
        booking_date: t.booking_date,
        amount: amt,
        reference_raw: ref,
        merchant_id: t.merchant_id ?? undefined,
      };
    });

    const enriched = categorizeBatch(pre);

    const rowsForStore = enriched.map((t) => ({
      booking_date: t.booking_date,
      amount: t.amount,
      currency: 'EUR',
      ref_raw: t.reference_raw,
      category: t.category,
      subcategory: t.subcategory,
      merchant_id: t.merchant_id,
    }));

    const uploadId = insertUpload(
      { ...parsed.diagnostics, quarantined_rows: parsed.quarantined_rows?.length ?? 0 },
      rowsForStore.length
    );
    insertTransactions(uploadId, rowsForStore);

    // quick totals for UI
    const totals = new Map<string, number>();
    for (const r of rowsForStore) {
      if (!r.category) continue;
      totals.set(r.category, (totals.get(r.category) || 0) + r.amount);
    }
    const categories = Array.from(totals, ([key, total]) => ({ key, total }));

    // persist disk snapshot for dev (works even without DB)
    try {
      saveLastUpload({
        uploadId,
        rows: rowsForStore,
        categories,
        savedAt: new Date().toISOString(),
      });
    } catch {/* ignore */}

    try {
      const dbgDir = path.join(process.cwd(), '.data');
      if (!fs.existsSync(dbgDir)) fs.mkdirSync(dbgDir, { recursive: true });
      fs.writeFileSync(
        path.join(dbgDir, 'last-debug.json'),
        JSON.stringify({
          sampleRawAmounts: (parsed.txs || []).slice(0, 6).map((t:any) => t.amount),
          sampleRefs: (parsed.txs || []).slice(0, 6).map((t:any) => (t.reference_raw ?? t.reference ?? '').toString().slice(0,180)),
          sampleCoerced: rowsForStore.slice(0, 6).map(r => r.amount),
          categories
        }, null, 2),
        'utf8'
      );
    } catch {/* ignore */}

    return Response.json({
      ok: true,
      uploadId,
      categories,
      warnings,
      diagnostics: parsed.diagnostics,
    });
  } catch (e: any) {
    return Response.json({
      ok: false,
      warnings: [String(e?.message ?? e)],
      diagnostics: { failed: true },
    });
  }
}
