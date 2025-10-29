import { headers } from 'next/headers';
import * as React from 'react';
import { DonutAreaAdapter } from '@/components/DonutAreaAdapter';

async function fetchCategories(uploadId: number) {
  // Build absolute base URL from request headers (works in dev/prod)
  const h = headers();
  const host = h.get('host') || `localhost:${process.env.PORT || 3001}`;
  const proto = process.env.VERCEL ? 'https' : 'http';
  const base = `${proto}://${host}`;

  const qs = Number.isFinite(uploadId) && uploadId > 0 ? `?uploadId=${uploadId}` : '';
  try {
    const res = await fetch(`${base}/api/categories${qs}`, { cache: 'no-store' });
    const json = await res.json();
    if (!json.ok) return { uploadId: 0, categories: [] as Array<{key:string; total:number}>, info: json.info || 'fetch failed' };
    return { uploadId: json.uploadId ?? uploadId, categories: (json.categories || []) as Array<{key:string; total:number}>, info: json.info };
  } catch (e:any) {
    console.error('fetchCategories error:', e);
    return { uploadId: 0, categories: [] as Array<{key:string; total:number}>, info: 'network error' };
  }
}

export default async function Page({ searchParams }: { searchParams: { uploadId?: string } }) {
  const raw = Number(searchParams?.uploadId ?? 0);
  const wantedUploadId = Number.isFinite(raw) && raw > 0 ? raw : 0;
  const data = await fetchCategories(wantedUploadId);

  // render your existing layout; below is a minimal data mount
  return <DonutAreaAdapter uploadId={data.uploadId} categories={data.categories} />;
}



