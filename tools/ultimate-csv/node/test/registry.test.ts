import { describe, it, expect } from 'vitest';
import { loadProfiles } from '../src/registry';
import path from 'node:path';

describe('registry', () => {
  it('loads profiles yaml', () => {
    const base = path.join(process.cwd(), 'tools', 'ultimate-csv', 'common');
    const p = loadProfiles(base);
    expect(p).toBeTruthy();
    expect(Object.keys(p).length).toBeGreaterThan(0);
  });
});


