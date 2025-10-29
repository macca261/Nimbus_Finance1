import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const buf = Buffer.from(await req.arrayBuffer());
    const target = `http://localhost:8080/ingest?lang=node&profile=auto&locale=de-DE&currency=EUR`;
    const res = await fetch(target, { method: 'POST', body: buf });
    const reader = res.body!.getReader();
    const dec = new TextDecoder();
    let processed = 0;
    const totals = new Map<string, number>();
    let done = false;
    while (!done) {
      const r = await reader.read();
      done = !!r.done;
      if (done) break;
      const value = r.value as Uint8Array;
      const text = dec.decode(value, { stream: true });
      for (const line of text.split(/\r?\n/)) {
        if (!line.trim()) continue;
        try {
          const obj = JSON.parse(line);
          const cat = obj.category || 'Sonstiges';
          totals.set(cat, (totals.get(cat) || 0) + Number(obj.amount || 0));
          processed++;
        } catch { /* ignore malformed line */ }
      }
    }
    const categories = Array.from(totals, ([key, total]) => ({ key, total }));
    return NextResponse.json({ ok: true, categories, uploadId: Date.now(), ndjsonLinesProcessed: processed });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) });
  }
}


