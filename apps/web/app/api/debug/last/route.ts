import { NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';

export async function GET() {
  try {
    const p = path.join(process.cwd(), '.data', 'last-debug.json');
    if (!fs.existsSync(p)) return NextResponse.json({ ok: true, info: 'no debug snapshot yet' });
    const json = JSON.parse(fs.readFileSync(p, 'utf8'));
    return NextResponse.json({ ok: true, ...json });
  } catch (e:any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) });
  }
}


