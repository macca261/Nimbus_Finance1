import { describe, it, expect } from 'vitest';
import { GET } from '../app/api/health/route';

describe('health route', () => {
  it('returns ok/db status', async () => {
    const res = await GET();
    const json = await (res as any).json();
    expect(json.ok).toBe(true);
    expect(['up','down']).toContain(json.db);
  });
});


