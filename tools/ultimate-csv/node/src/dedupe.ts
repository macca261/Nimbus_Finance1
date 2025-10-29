import crypto from 'node:crypto';

export function dedupeKey(o: any): string {
  const basis = [o.booking_date || '', o.value_date || '', String(o.amount || 0), o.currency || '', o.counterparty_name || '', o.reference || '', o.account_id || ''].join('|');
  return crypto.createHash('sha256').update(basis).digest('hex');
}

export function isRecurring(history: Map<string, number>, key: string): boolean {
  // Minimal heuristic: if we saw this amount 2+ times, call it recurring
  const c = history.get(key) || 0;
  history.set(key, c + 1);
  return c + 1 >= 2;
}


