import fs from 'node:fs';
import path from 'node:path';

// input: .data/last-upload.json (written by /api/parse)
const dataDir = path.join(process.cwd(), '.data');
const lastPath = path.join(dataDir, 'last-upload.json');

const fixturesDir = path.join(process.cwd(), 'packages', 'bank-profiles', 'fixtures');
const outCsv = path.join(fixturesDir, 'demo_de_generic.csv');
const outInfo = path.join(fixturesDir, 'demo_de_generic.info.json');

type Row = {
  booking_date: string;
  amount: number;
  currency: string;
  ref_raw?: string;
  category?: string;
  subcategory?: string;
  merchant_id?: string;
};

function hashWord(w: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < w.length; i++) {
    h ^= w.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

function anonymize(rows: Row[]) {
  const merchantMap = new Map<string,string>();
  let mCount = 0;

  const clean = rows.map(r => {
    const name = (r.subcategory || r.merchant_id || r.ref_raw || '').trim();
    let anon = '';
    if (name) {
      const key = name.toUpperCase().replace(/\s+/g,' ').slice(0,80);
      if (!merchantMap.has(key)) {
        mCount++; merchantMap.set(key, `MERC#${mCount}`);
      }
      anon = merchantMap.get(key)!;
    }
    // strip IBANs & long numbers from ref_raw
    let ref = (r.ref_raw || '')
      .replace(/[A-Z]{2}\d{2}[A-Z0-9]{10,}/g, 'IBAN#' + hashWord(r.ref_raw || ''))
      .replace(/\b[0-9]{8,}\b/g, 'NUM#')
      .replace(/\s+/g, ' ')
      .trim();

    return {
      booking_date: r.booking_date,
      amount: Number(r.amount) || 0,
      currency: r.currency || 'EUR',
      ref_raw: ref ? `TXT#${hashWord(ref)}` : '',
      category: r.category || '',
      subcategory: anon,
      merchant_id: anon,
    };
  });

  return { rows: clean, merchants: Object.fromEntries(merchantMap) };
}

function toCsv(rows: ReturnType<typeof anonymize>["rows"]) {
  const cols = ['Buchungstag','Betrag','Währung','Verwendungszweck','Kategorie','Unterkategorie','Händler'];
  const lines = [cols.join(';')];
  for (const r of rows) {
    lines.push([
      r.booking_date,
      r.amount.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      r.currency,
      r.ref_raw,
      r.category,
      r.subcategory,
      r.merchant_id,
    ].join(';'));
  }
  return lines.join('\n');
}

(function main() {
  if (!fs.existsSync(lastPath)) {
    console.error('No .data/last-upload.json found. Upload a CSV first.');
    process.exit(1);
  }
  if (!fs.existsSync(fixturesDir)) fs.mkdirSync(fixturesDir, { recursive: true });

  const snap = JSON.parse(fs.readFileSync(lastPath, 'utf8'));
  const { rows, categories, uploadId } = snap;
  const { rows: anonRows, merchants } = anonymize(rows);

  fs.writeFileSync(outCsv, toCsv(anonRows), 'utf8');
  fs.writeFileSync(outInfo, JSON.stringify({ uploadId, merchants, categories }, null, 2), 'utf8');

  console.log('Fixture written:\n ', outCsv, '\n ', outInfo);
})();


