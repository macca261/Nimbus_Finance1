import { NextResponse } from 'next/server';
import { getCategoryTotals, getLastUploadId } from '@/lib/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const which = searchParams.get('uploadId') || 'latest';
  let uploadId = Number(which);
  if (!Number.isFinite(uploadId) || uploadId <= 0) {
    const latest = getLastUploadId();
    if (!latest) return NextResponse.json({ ok: true, info: 'no uploads yet', uploadId: null, categories: [] });
    uploadId = latest;
  }
  const categories = getCategoryTotals(uploadId)
    .filter((r) => r.key)
    .sort((a, b) => Math.abs(b.total) - Math.abs(a.total));
  return NextResponse.json({ ok: true, uploadId, categories });
}


