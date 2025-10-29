import fs from 'node:fs';
import path from 'node:path';

const dataDir = path.join(process.cwd(), '.data');
const lastPath = path.join(dataDir, 'last-upload.json');

export type StoredRow = {
  booking_date: string;
  amount: number;
  currency: string;
  ref_raw?: string;
  category?: string;
  subcategory?: string;
  merchant_id?: string;
};
export type LastUpload = {
  uploadId: number;
  rows: StoredRow[];
  categories: Array<{ key: string; total: number }>;
  savedAt: string;
};

export function saveLastUpload(payload: LastUpload) {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(lastPath, JSON.stringify(payload, null, 2), 'utf8');
}

export function readLastUpload(): LastUpload | null {
  try {
    if (!fs.existsSync(lastPath)) return null;
    const raw = fs.readFileSync(lastPath, 'utf8');
    return JSON.parse(raw) as LastUpload;
  } catch {
    return null;
  }
}


