import { describe, it, expect } from 'vitest';
import { categorizeBatch } from '../src/index';

describe('categorize rules', () => {
  it('detects payroll', () => {
    const res = categorizeBatch([
      { booking_date: '2024-02-01', amount: 2500, reference_raw: 'GEHALT FEB 2024 Musterfirma GmbH' },
    ]);
    expect(res[0].category).toBe('Einkommen');
    expect(res[0].subcategory).toBe('Gehalt');
  });

  it('detects groceries', () => {
    const res = categorizeBatch([
      { booking_date: '2024-02-03', amount: -42.35, reference_raw: 'Kartenzahlung REWE-MARKT 123 Köln' },
    ]);
    expect(res[0].category).toBe('Einkaufen');
    expect(res[0].subcategory).toBe('REWE');
  });

  it('detects rent', () => {
    const res = categorizeBatch([
      { booking_date: '2024-02-05', amount: -950, reference_raw: 'MIETE Februar 2024' },
    ]);
    expect(res[0].category).toBe('Wohnen');
    expect(res[0].subcategory).toBe('Miete');
  });

  it('falls back to Sonstiges when unsure', () => {
    const res = categorizeBatch([
      { booking_date: '2024-02-07', amount: -11.11, reference_raw: 'Unklare Zahlung XYZ-123' },
    ]);
    expect(res[0].category).toBe('Sonstiges');
  });
});


