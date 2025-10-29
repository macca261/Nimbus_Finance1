import { NextResponse } from 'next/server';
import { getCategoryTotals, getLastUploadId } from '@/lib/db';
import { readLastUpload } from '@/lib/state';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  let uploadId = Number(searchParams.get('uploadId') || '0');

  // try DB first (latest if missing)
  if (!Number.isFinite(uploadId) || uploadId <= 0) {
    const latest = getLastUploadId();
    if (latest) uploadId = latest;
  }

  if (Number.isFinite(uploadId) && uploadId > 0) {
    const rows = getCategoryTotals(uploadId)
      .filter((r) => r.key)
      .sort((a, b) => Math.abs(b.total) - Math.abs(a.total));
    if (rows.length > 0) {
      return NextResponse.json({ ok: true, uploadId, categories: rows, source: 'db' });
    }
  }

  // DB empty or unavailable → disk fallback
  const snap = readLastUpload();
  if (snap && snap.categories?.length) {
    return NextResponse.json({ ok: true, uploadId: snap.uploadId, categories: snap.categories, source: 'disk' });
  }

  return NextResponse.json({ ok: true, categories: [], info: 'no uploads yet' });
}


