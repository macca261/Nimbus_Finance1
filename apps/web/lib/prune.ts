import { db } from './db';

export function pruneOldUploads(retentionHours: number, dryRun = true): { deleted: number } {
  if (!db) return { deleted: 0 };
  const cutoff = new Date(Date.now() - retentionHours * 3600_000).toISOString();
  const candidates = db.prepare('SELECT id FROM uploads WHERE created_at < ?').all(cutoff) as Array<{ id: number }>;
  if (!dryRun) {
    const delTx = db.transaction((ids: number[]) => {
      for (const id of ids) {
        db.prepare('DELETE FROM transactions WHERE upload_id = ?').run(id);
        db.prepare('DELETE FROM uploads WHERE id = ?').run(id);
      }
    });
    delTx(candidates.map((c) => c.id));
  }
  return { deleted: candidates.length };
}


