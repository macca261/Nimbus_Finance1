import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { parseBufferToTxs } from '../src/parse';

describe('never-throw property', () => {
  it('does not throw for random delimiters/thousands/decimals', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            date: fc.date(),
            sign: fc.constantFrom('-', '', ''),
            amount: fc.double({ min: -10000, max: 10000 }),
            ref: fc.string({ maxLength: 20 })
          }),
          { minLength: 1, maxLength: 20 }
        ),
        (rows) => {
          const del = fc.sample(fc.constantFrom(';', ',', '\t'), 1)[0];
          const dec = fc.sample(fc.constantFrom(',', '.'), 1)[0] as ',' | '.';
          const thou = dec === ',' ? '.' : ',';
          const header = `Buchungstag${del}Betrag${del}Währung${del}Verwendungszweck`;
          const body = rows
            .map((r) => {
              const d = r.date;
              const dd = String(d.getDate()).padStart(2, '0');
              const mm = String(d.getMonth() + 1).padStart(2, '0');
              const yyyy = String(d.getFullYear());
              const amt = Math.abs(r.amount).toFixed(2).replace('.', dec);
              const signed = (r.amount < 0 ? '-' : '') + amt;
              return `${dd}.${mm}.${yyyy}${del}${signed}${del}EUR${del}${r.ref}`;
            })
            .join('\n');
          const csv = header + '\n' + body + '\n';
          const res = parseBufferToTxs(Buffer.from(csv));
          expect(res).toBeTruthy();
          expect(Array.isArray(res.txs)).toBe(true);
          expect(res.warnings).toBeDefined();
        }
      ),
      { numRuns: 50 }
    );
  });
});


