#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'csv-parse';
import iconv from 'iconv-lite';
import minimist from 'minimist';
import crypto from 'node:crypto';
import { detect } from './detect';
import { toISODate, toNumberDE } from './normalize';
import { dedupeKey, isRecurring } from './dedupe';
import { loadRules, normalizeMerchant, categorize } from './categorize';
import { loadProfiles } from './registry';

const argv = minimist(process.argv.slice(2));
const cmd = argv._[0] || 'ingest';

async function main() {
  if (cmd === 'ingest') return ingest();
  if (cmd === 'detect') return doDetect();
}

function readAll(inputPath?: string): Buffer {
  if (!inputPath || inputPath === '-' ) return fs.readFileSync(0);
  return fs.readFileSync(path.resolve(inputPath));
}

function doDetect() {
  const buf = readAll(argv.input as string);
  const info = detect(buf);
  process.stdout.write(JSON.stringify(info) + '\n');
}

function ingest() {
  const buf = readAll(argv.input as string);
  const info = detect(buf);
  const base = path.join(process.cwd(), 'tools', 'ultimate-csv');
  const profiles = loadProfiles(path.join(base, 'common'));
  const { rules, aliases } = loadRules(path.join(base, 'common', 'rules'));
  const profile = argv['bank-profile'] || 'auto';
  const currency = argv.currency || 'EUR';
  const locale = argv.locale || 'de-DE';
  const encoding = info.encoding === 'utf8' ? 'utf8' : info.encoding === 'win1252' ? 'win1252' : 'latin1';
  const dec = iconv.decode(buf, encoding);
  const delim = info.delimiter === '\t' ? '\t' : info.delimiter;
  const prof = profile !== 'auto' ? profiles[profile] : undefined;
  const columns = prof?.columns;
  const dateFmt = prof?.date_format || 'dd.MM.yyyy';
  const parser = parse(dec, { delimiter: prof?.delimiter || delim, bom: true, columns: true, relax_quotes: true, skip_empty_lines: true, trim: true });
  const recHistory = new Map<string, number>();
  for (const record of (parser as any)) {}
  parser.on('readable', () => {
    let rec;
    // eslint-disable-next-line no-cond-assign
    while ((rec = parser.read()) !== null) {
      const rawRef = rec[columns?.reference || 'Verwendungszweck'] || rec['Merchant'] || '';
      const amountRaw = rec[columns?.amount || 'Betrag'] || rec['Betrag (EUR)'] || rec['Amount (EUR)'] || '';
      const bookingRaw = rec[columns?.booking_date || 'Buchungstag'] || rec['Date'] || '';
      const valueRaw = rec[columns?.value_date || 'Wertstellung'] || '';
      const merchantName = normalizeMerchant(rawRef, aliases);
      const amount = toNumberDE(amountRaw);
      const booking_date = toISODate(String(bookingRaw), dateFmt);
      const value_date = valueRaw ? toISODate(String(valueRaw), dateFmt) : undefined;
      const direction = amount < 0 ? 'debit' : 'credit';
      const account_id = crypto.createHash('sha256').update('IBAN|BANK|LAST4').digest('hex');
      const raw_hash = crypto.createHash('sha256').update(JSON.stringify(rec)).digest('hex');
      const cat = categorize(String(rawRef), merchantName, rules);
      const recurring = isRecurring(recHistory, `${Math.abs(amount).toFixed(2)}|${merchantName || ''}`);
      const out = {
        booking_date,
        value_date,
        amount,
        currency,
        direction,
        counterparty_name: undefined,
        counterparty_iban: undefined,
        reference: String(rawRef || ''),
        merchant_id: merchantName,
        merchant_name: merchantName,
        category: cat.category,
        subcategory: cat.subcategory,
        account_id,
        source: 'csv',
        raw_hash,
        is_recurring: recurring,
        ingest_notes: [] as string[],
      };
      const key = dedupeKey(out);
      (out as any).dedupe_key = key;
      process.stdout.write(JSON.stringify(out) + '\n');
    }
  });
  parser.on('error', (e) => {
    process.stderr.write(String(e) + '\n');
    process.exitCode = 1;
  });
  parser.on('end', () => {});
}

main();


