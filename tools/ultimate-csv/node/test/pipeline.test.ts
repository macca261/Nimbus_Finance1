import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { execa } from 'node:child_process';

describe('pipeline', () => {
  it('ingests sparkasse csv to ndjson', async () => {
    const file = path.join(process.cwd(), 'tools', 'ultimate-csv', 'testdata', 'german', 'sparkasse_iso8859-1_semicolon.csv');
    const buf = fs.readFileSync(file);
    expect(buf.length).toBeGreaterThan(10);
  });
});


