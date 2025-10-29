import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const url = new URL(req.url);
  if (url.pathname.startsWith('/api/chat')) {
    // Simple gate: require cookie demo_tier != free
    const tier = req.cookies.get('demo_tier')?.value || 'free';
    if (tier === 'free') {
      return NextResponse.json({ error: 'chat not available on free tier' }, { status: 403 });
    }
  }
  return NextResponse.next();
}

export const config = { matcher: ['/api/:path*'] };


