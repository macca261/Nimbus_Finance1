import { describe, it, expect } from 'vitest';
import { categorizeBatch } from '../dist/index.js';

describe('categorize rules (js build)', () => {
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
});