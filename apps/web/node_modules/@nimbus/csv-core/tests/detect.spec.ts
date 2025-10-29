import { describe, it, expect } from 'vitest';
import { detectDialect } from '../src/detectDialect';

describe('detectDialect', () => {
  it('detects semicolon and decimal comma', () => {
    const sample = Buffer.from('A;B;C\n1,23;4,56;7,89\n');
    const d = detectDialect(sample);
    expect(d.delimiter).toBe(';');
    expect(d.decimal).toBe(',');
  });

  it('detects tab delimiter', () => {
    const sample = Buffer.from('A\tB\tC\n1\t2\t3\n');
    const d = detectDialect(sample);
    expect(d.delimiter).toBe('\t');
  });
});


