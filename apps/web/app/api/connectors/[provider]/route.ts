export async function POST(_req: Request, { params }: { params: { provider: string } }) {
  return Response.json({ status: 'stub', provider: params.provider });
}


