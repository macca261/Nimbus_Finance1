import { NextResponse } from 'next/server';
import { readLastUpload } from '@/lib/state';

export async function GET() {
  const snap = readLastUpload();
  if (!snap) return NextResponse.json({ ok: true, info: 'no snapshot' });
  // show first 10 rows for quick sanity
  const rows = snap.rows.slice(0, 10).map(r => ({
    booking_date: r.booking_date,
    amount: r.amount,
    category: r.category,
    subcategory: r.subcategory,
    ref_raw: (r.ref_raw || '').slice(0, 120)
  }));
  return NextResponse.json({ ok: true, uploadId: snap.uploadId, sample: rows, categories: snap.categories });
}


