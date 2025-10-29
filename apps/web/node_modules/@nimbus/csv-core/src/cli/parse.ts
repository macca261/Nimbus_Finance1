#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { parseBufferToTxs } from '../parse.js';
import YAML from 'yaml';

function parseArgs(argv: string[]) {
  const args = { file: '', profile: '', ndjson: false } as { file: string; profile?: string; ndjson: boolean };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i] ?? '';
    if (!args.file && !a.startsWith('--')) { args.file = a; continue; }
    if (a === '--ndjson') args.ndjson = true;
    if (a === '--profile') { args.profile = argv[++i] || ''; }
  }
  return args;
}

const args = parseArgs(process.argv);
if (!args.file) {
  console.error('Usage: pnpm parse <file.csv> [--profile id] [--ndjson]');
  process.exit(1);
}

const full = path.resolve(process.cwd(), args.file);
const buf = fs.readFileSync(full);
const res = parseBufferToTxs(buf);

if (args.ndjson) {
  const first = res.txs.slice(0, 5);
  for (const t of first) process.stdout.write(JSON.stringify(t) + '\n');
  process.stdout.write('# diagnostics\n');
  process.stdout.write(YAML.stringify(res.diagnostics));
} else {
  console.log(JSON.stringify({ txs: res.txs.slice(0, 5), warnings: res.warnings, diagnostics: res.diagnostics }, null, 2));
}


