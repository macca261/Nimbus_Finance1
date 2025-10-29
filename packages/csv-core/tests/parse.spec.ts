import { describe, it, expect } from 'vitest';
import { parseBufferToTxs } from '../src/parse';

describe('parseBufferToTxs', () => {
  it('parses EU amounts and dates', () => {
    const csv = 'Buchungstag;Betrag;Währung;Verwendungszweck\n01.02.2024;1.234,56;EUR;REWE Einkauf\n02.02.2024;7,89-;EUR;Lastschrift' ;
    const res = parseBufferToTxs(Buffer.from(csv), { delimiter: ';', decimal: ',', thousand: '.' });
    expect(res.txs.length).toBe(2);
    expect(res.txs[0].amount).toBeCloseTo(1234.56, 2);
    expect(res.txs[0].booking_date).toBe('2024-02-01');
    expect(res.txs[1].amount).toBeCloseTo(-7.89, 2);
  });

  it('never throws on malformed rows', () => {
    const csv = 'Buchungstag;Betrag;Währung\nINVALID;xx;EUR\n';
    const res = parseBufferToTxs(Buffer.from(csv), { delimiter: ';', decimal: ',', thousand: '.' });
    expect(res.txs.length).toBe(0);
    expect(res.warnings.length).toBeGreaterThan(0);
  });
});


