import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { alias, category } = body || {};
    if (!alias || !category) return NextResponse.json({ ok:false, error:'alias & category required' }, { status:400 });
    if (!db) return NextResponse.json({ ok:false, error:'db down' }, { status:200 });
    // upsert merchant + alias
    const merchantId = (alias as string).toUpperCase();
    db.prepare('INSERT OR IGNORE INTO merchants (id, name) VALUES (?, ?)').run(merchantId, alias);
    db.prepare('INSERT INTO merchant_aliases (alias, merchant_id, user_id) VALUES (?, ?, ?)').run(merchantId, merchantId, null);
    return NextResponse.json({ ok:true });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error:String(e?.message||e) }, { status:200 });
  }
}


