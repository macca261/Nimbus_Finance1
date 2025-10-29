import { NextResponse } from 'next/server';
import { getMerchantTotalsByCategory } from '@/lib/db';
import { readLastUpload } from '@/lib/state';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const uploadId = Number(searchParams.get('uploadId') || '0');
  const category = String(searchParams.get('category') || '');

  if (!category) return NextResponse.json({ ok: false, error: 'category required' }, { status: 400 });

  // try DB first
  if (Number.isFinite(uploadId) && uploadId > 0) {
    try {
      const merchants = getMerchantTotalsByCategory(uploadId, category)
        .sort((a, b) => Math.abs(b.total) - Math.abs(a.total));
      if (merchants.length) return NextResponse.json({ ok: true, uploadId, merchants, source: 'db' });
    } catch { /* ignore */ }
  }

  // fallback to disk snapshot
  const snap = readLastUpload();
  if (snap?.rows?.length) {
    const totals = new Map<string, number>();
    for (const r of snap.rows) {
      if (r.category !== category) continue;
      const name = r.subcategory || r.merchant_id || r.ref_raw || '';
      const amt = typeof r.amount === 'string' ? Number(r.amount) : Number(r.amount ?? 0);
      totals.set(name, (totals.get(name) || 0) + (Number.isFinite(amt) ? amt : 0));
    }
    const merchants = Array.from(totals, ([name, total]) => ({ name, total }))
      .sort((a, b) => Math.abs(b.total) - Math.abs(a.total));
    return NextResponse.json({ ok: true, uploadId: snap.uploadId, merchants, source: 'disk' });
  }

  return NextResponse.json({ ok: true, merchants: [] });
}
