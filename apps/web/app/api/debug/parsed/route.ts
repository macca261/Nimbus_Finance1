import { NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';

export async function GET() {
  const p = path.join(process.cwd(), '.data', 'last-parsed.json');
  if (!fs.existsSync(p)) return NextResponse.json({ ok: false, info: 'no last-parsed.json yet — upload a CSV first' });
  const json = JSON.parse(fs.readFileSync(p, 'utf8'));
  return NextResponse.json({ ok: true, ...json });
}


