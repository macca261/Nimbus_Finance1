import { db, insertTransactions, insertUpload } from './db';
import { listQueued, readNdjson, removeFile } from './queue';

let started = false;
export function startWorker() {
  if (started) return; started = true;
  setInterval(() => {
    try {
      if (!db) return; // DB down
      const files = listQueued();
      for (const f of files) {
        const rows = readNdjson(f);
        const uploadId = insertUpload({ queuedIngested: true }, rows.length);
        insertTransactions(uploadId, rows);
        removeFile(f);
      }
    } catch (_e) {
      // swallow errors in background
    }
  }, 15_000);
}

startWorker();


