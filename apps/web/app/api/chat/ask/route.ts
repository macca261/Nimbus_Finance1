export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const q = body.q || '';
  return Response.json({ answer: `Stub: Zusammenfassung für "${q}". (Demo)` });
}


