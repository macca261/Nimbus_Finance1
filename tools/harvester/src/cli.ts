#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

type Candidate = { provider: string; repo: string; path: string };

function list(): Candidate[] {
  // Stub: In real use, query GitHub providers like firefly-iii import-configurations, ofxstatement-*
  return [
    { provider: 'seed', repo: 'local', path: 'paypal.csv' },
    { provider: 'seed', repo: 'local', path: 'n26_de.csv' }
  ];
}

function run(): void {
  const root = process.cwd();
  const profilesDir = path.join(root, 'packages/bank-profiles/profiles');
  const fixturesDir = path.join(root, 'apps/web/public/fixtures/public');
  fs.mkdirSync(profilesDir, { recursive: true });
  fs.mkdirSync(fixturesDir, { recursive: true });
  const profile = {
    bank_id: 'sample_bank',
    encodings: ['utf8'],
    delimiters: [';'],
    decimal: ',',
    thousand: '.',
    date_formats: { booking_date: ['dd.MM.yyyy'] },
    headers: { booking_date: ['Buchungstag'], amount: ['Betrag'], currency: ['Währung'] },
    rules: { invert_sign_if: [] },
    source: { provider: 'seed', repo: 'local', path: 'sample.csv' }
  };
  const yaml = YAML.stringify(profile);
  fs.writeFileSync(path.join(profilesDir, 'sample_bank.yml'), yaml);
  fs.writeFileSync(path.join(fixturesDir, 'sample.csv'), 'Buchungstag;Betrag;Währung\n01.01.2024;1,23;EUR\n');
  console.log('Wrote sample profile and fixture.');
}

const cmd = process.argv[2] || 'list';
if (cmd === 'list') {
  const items = list();
  for (const c of items) console.log(`${c.provider}\t${c.repo}\t${c.path}`);
} else if (cmd === 'run') {
  run();
} else {
  console.error('Unknown command');
  process.exitCode = 1;
}


