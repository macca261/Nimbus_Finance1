import fs from 'node:fs';
import path from 'node:path';

const queueDir = path.join(process.cwd(), '.queue', 'uploads');
export function ensureQueueDir() { fs.mkdirSync(queueDir, { recursive: true }); }

export function enqueueNdjson(rows: Array<{ booking_date: string; amount: number; currency: string; ref_raw?: string; category?: string; subcategory?: string; merchant_id?: string }>): string {
  ensureQueueDir();
  const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.ndjson`;
  const full = path.join(queueDir, name);
  const data = rows.map((r) => JSON.stringify(r)).join('\n') + '\n';
  fs.writeFileSync(full, data);
  return full;
}

export function listQueued(): string[] {
  ensureQueueDir();
  return fs.readdirSync(queueDir).filter((f) => f.endsWith('.ndjson')).map((f) => path.join(queueDir, f));
}

export function readNdjson(file: string): Array<{ booking_date: string; amount: number; currency: string; ref_raw?: string; category?: string; subcategory?: string; merchant_id?: string }> {
  const txt = fs.readFileSync(file, 'utf8');
  return txt.split(/\n/).filter(Boolean).map((l) => JSON.parse(l));
}

export function removeFile(file: string) {
  try { fs.unlinkSync(file); } catch (e) { /* ignore */ }
}


