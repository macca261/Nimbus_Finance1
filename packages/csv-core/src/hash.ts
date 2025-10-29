import { createHash } from 'crypto';
import type { Tx } from './schema';

export function hashTxInput(input: {
  bank_id?: string;
  booking_date: string;
  amount: number;
  reference_raw?: string;
}): string {
  const h = createHash('sha256');
  h.update((input.bank_id ?? '') + '|');
  h.update(input.booking_date + '|');
  h.update(String(input.amount) + '|');
  h.update(input.reference_raw ?? '');
  return h.digest('hex');
}

export function attachHash(tx: Omit<Tx, 'hash'> & { bank_id?: string }): Tx {
  const { bank_id, ...rest } = tx as any;
  const hash = hashTxInput({
    bank_id,
    booking_date: rest.booking_date,
    amount: rest.amount,
    reference_raw: rest.reference_raw
  });
  return { ...(rest as Tx), hash };
}


