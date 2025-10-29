import { db } from '@/lib/db';
import '@/lib/worker';

export async function GET() {
  return Response.json({ ok: true, db: db ? 'up' : 'down' });
}


