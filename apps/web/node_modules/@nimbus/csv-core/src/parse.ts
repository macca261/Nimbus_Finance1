import { parse as csvParse } from 'csv-parse/sync';
import iconv from 'iconv-lite';
import { txSchema, type ParseResult, type Dialect, type Tx } from './schema';
import { detectDialect } from './detectDialect';
import { attachHash } from './hash';

type ParseOptions = Partial<Dialect> & {
  bank_id?: string;
  currency?: string;
};

function toUtf8(buffer: Uint8Array, encoding: Dialect['encoding']): string {
  if (encoding === 'utf8-bom') {
    const b = Buffer.from(buffer);
    const noBom = b[0] === 0xef && b[1] === 0xbb && b[2] === 0xbf ? b.subarray(3) : b;
    return noBom.toString('utf8');
  }
  if (encoding === 'utf8') return Buffer.from(buffer).toString('utf8');
  return iconv.decode(Buffer.from(buffer), encoding);
}

function parseAmount(raw: string, decimal: ',' | '.', thousand: ',' | '.' | ''): number | null {
  let s = String(raw).trim();
  // handle CR/DR
  const isCredit = /\bCR\b/i.test(s);
  const isDebit = /\bDR\b/i.test(s);
  s = s.replace(/\bCR\b|\bDR\b/gi, '').trim();
  // trailing minus
  const trailingMinus = /-$/.test(s);
  s = s.replace(/-/g, '');
  if (thousand) s = s.replace(new RegExp(`\\${thousand}`, 'g'), '');
  if (decimal === ',') s = s.replace(/,/g, '.');
  const n = Number(s);
  if (!isFinite(n)) return null;
  let amount = n;
  if (trailingMinus || isDebit) amount = -Math.abs(amount);
  if (isCredit) amount = Math.abs(amount);
  return amount;
}

function parseDate(raw: string): string | null {
  const s = String(raw).trim();
  const ddmmyyyy = /^(\d{2})\.(\d{2})\.(\d{4})$/;
  const ddmmyy = /^(\d{2})\.(\d{2})\.(\d{2})$/;
  const yyyymmdd = /^(\d{4})-(\d{2})-(\d{2})$/;
  const mmddyyyy = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  let m;
  if ((m = s.match(ddmmyyyy))) return `${m[3]}-${m[2]}-${m[1]}`;
  if ((m = s.match(ddmmyy))) {
    const year = Number(m[3]);
    const y = year >= 70 ? 1900 + year : 2000 + year;
    return `${y}-${m[2]}-${m[1]}`;
  }
  if ((m = s.match(yyyymmdd))) return s;
  if ((m = s.match(mmddyyyy))) return `${m[3]}-${m[1]}-${m[2]}`;
  return null;
}

function findHeaderLine(text: string, delimiter: string): { index: number; columns: string[] } | null {
  const alias = new Set([
    'buchungstag','booking date','booking_date','date','datum'
  ]);
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < Math.min(lines.length, 200); i++) {
    const raw = lines[i];
    if (!raw || !raw.trim()) continue;
    const cols = (delimiter === '\t' ? raw.split('\t') : raw.split(delimiter)).map((s) => s.trim().toLowerCase());
    if (cols.some((c) => alias.has(c))) return { index: i, columns: cols };
    const low = raw.toLowerCase();
    if (low.includes('buchungstag')) return { index: i, columns: cols };
  }
  return null;
}

export function parseBufferToTxs(buffer: Uint8Array, opts: ParseOptions = {}): ParseResult {
  const sampleDialect = detectDialect(buffer);
  const dialect: Dialect = {
    encoding: opts.encoding ?? sampleDialect.encoding,
    delimiter: opts.delimiter ?? sampleDialect.delimiter,
    decimal: opts.decimal ?? sampleDialect.decimal,
    thousand: opts.thousand ?? sampleDialect.thousand
  };

  const text = toUtf8(buffer, dialect.encoding);
  const warnings: string[] = [];
  const quarantined_rows: string[] = [];

  let records: string[][] = [];
  // preamble skipper: find header row
  const headerInfo = findHeaderLine(text, dialect.delimiter === '\t' ? '\t' : dialect.delimiter);
  const effectiveText = headerInfo ? text.split(/\r?\n/).slice(headerInfo.index).join('\n') : text;

  try {
    records = csvParse(effectiveText, {
      delimiter: dialect.delimiter === '\t' ? '\t' : dialect.delimiter,
      relaxQuotes: true,
      relaxColumnCount: true,
      bom: dialect.encoding === 'utf8-bom',
      skipEmptyLines: true
    });
  } catch (e: any) {
    warnings.push(`CSV_PARSE_ERROR: ${String(e && e.message ? e.message : e)}`);
  }

  if (records.length === 0) {
    return {
      txs: [],
      warnings,
      diagnostics: { rows: 0, quarantined: 0, sampleDialect, columnsDetected: 0, headerLine: headerInfo ? (headerInfo.index + 1) : undefined },
      quarantined_rows
    };
  }

  // Assume first row is header
  const [header, ...rows] = records;
  if (!header) {
    return { txs: [], warnings, diagnostics: { rows: 0, quarantined: 0, sampleDialect, columnsDetected: 0, headerLine: headerInfo ? (headerInfo.index + 1) : undefined }, quarantined_rows };
  }
  const columnsDetected = header.length;
  const headerMap = header.map((h) => String(h).toLowerCase());

  const txs: Tx[] = [];
  let quarantined = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i] ?? [];
    const rec: Record<string, string> = {};
    for (let c = 0; c < headerMap.length; c++) {
      const key = headerMap[c];
      if (!key) continue;
      rec[key] = String(row[c] ?? '');
    }

    const bookingRaw = rec['buchungstag'] || rec['booking date'] || rec['booking_date'] || rec['date'] || rec['datum'] || rec['valuta'] || rec['value date'] || '';
    const valueRaw = rec['valuta'] || rec['value date'] || '';
    let amountRaw = rec['betrag'] || rec['amount'] || rec['umsatz'] || rec['value'] || '';
    if (!amountRaw || amountRaw.length === 0) {
      const amtKey = Object.keys(rec).find((k) => k.startsWith('betrag') || k.includes('betrag') || k.includes('amount'));
      if (amtKey) amountRaw = rec[amtKey] ?? '';
    }
    const currency = (opts.currency || rec['currency'] || rec['währung'] || 'EUR').toString().toUpperCase();
    const ref = rec['verwendungszweck'] || rec['reference'] || rec['description'] || rec['text'] || '';
    const iban = rec['iban'] || rec['kontonummer'] || '';

    const booking_date = parseDate(bookingRaw);
    const value_date = valueRaw ? parseDate(valueRaw) : null;
    const amount = parseAmount(amountRaw, dialect.decimal, dialect.thousand);

    if (!booking_date || amount == null) {
      quarantined++;
      warnings.push('ROW_UNPARSEABLE');
      quarantined_rows.push(row.join(dialect.delimiter));
      continue;
    }

    const base = {
      currency,
      booking_date,
      value_date: value_date ?? undefined,
      amount,
      reference_raw: ref || undefined,
      counterparty_iban: iban || undefined
    } as Omit<Tx, 'hash'>;
    const withHash = attachHash({ ...base, bank_id: opts.bank_id });
    const parsed = txSchema.safeParse(withHash);
    if (!parsed.success) {
      quarantined++;
      warnings.push(`ROW_INVALID: ${parsed.error.message}`);
      quarantined_rows.push(row.join(dialect.delimiter));
      continue;
    }
    txs.push(parsed.data);
  }

  return {
    txs,
    warnings,
    diagnostics: {
      rows: records.length - 1,
      quarantined,
      columnsDetected,
      sampleDialect,
      headerLine: headerInfo ? (headerInfo.index + 1) : undefined
    },
    quarantined_rows
  };
}


