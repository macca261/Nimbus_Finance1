import { NextResponse } from 'next/server';
import { getLastUploadId } from '@/lib/db';

export async function GET() {
  try {
    const last = getLastUploadId();
    return NextResponse.json({ ok: true, lastUploadId: last ?? null });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error:String(e?.message||e) }, { status:200 });
  }
}


