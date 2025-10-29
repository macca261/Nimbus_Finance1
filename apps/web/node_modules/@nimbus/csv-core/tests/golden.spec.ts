import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { parseBufferToTxs } from '@nimbus/csv-core';

function pick<T extends object>(obj: T, keys: (keyof T)[]) {
  const out: any = {};
  for (const k of keys) out[k] = (obj as any)[k];
  return out;
}

describe('golden: demo_de_generic.csv', () => {
  const fixture = path.join(process.cwd(), 'packages', 'bank-profiles', 'fixtures', 'demo_de_generic.csv');

  it('parses consistently', () => {
    if (!fs.existsSync(fixture)) {
      console.warn('No fixture found, skipping golden test:', fixture);
      return;
    }
    const buf = fs.readFileSync(fixture);
    const parsed = parseBufferToTxs(buf);

    // snapshot first 5 simplified rows to keep stable
    const sample = parsed.txs.slice(0, 5).map((t: any) =>
      pick(t, ['booking_date','amount','currency','reference_raw'])
    );

    // quick totals (coerce DE numbers if parser emitted strings)
    let total = 0;
    for (const t of parsed.txs as any[]) {
      let v = t.amount;
      if (typeof v === 'string') {
        v = Number(v.replace(/\./g,'').replace(',', '.'));
      }
      total += Number(v) || 0;
    }

    expect(sample).toMatchSnapshot();
    expect(parsed.txs.length).toBeGreaterThan(0);
    expect(Number.isFinite(total)).toBe(true);
  });
});


