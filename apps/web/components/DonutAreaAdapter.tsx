'use client';
import * as React from 'react';
import { MerchantBreakdown } from '@/components/MerchantBreakdown';
import { DonutChart } from '@nimbus/ui';

export function DonutAreaAdapter({
  uploadId,
  categories
}: {
  uploadId: number;
  categories: Array<{ key: string; total: number }>;
}) {
  const [selected, setSelected] = React.useState(categories?.[0]?.key ?? '');

  React.useEffect(() => {
    if (!selected && categories[0]) setSelected(categories[0].key);
  }, [categories, selected]);

  // map to DonutChart slice shape { key, value, color }
  const data = categories.map(c => ({ key: c.key, value: Math.abs(c.total), color: '#3A66FF' }));

  const empty = !categories || categories.length === 0;

  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
      <div>
        {empty ? (
          <div style={{ padding:16, border:'1px solid #E6E9F2', borderRadius:12, background:'#fff' }}>
            <b>Keine Daten gefunden.</b>
            <div style={{ color:'#6B7280', marginTop:6 }}>
              Bitte CSV hochladen.
            </div>
            <div style={{ marginTop:12 }}>
              <a href="/upload" style={{ textDecoration:'underline' }}>CSV hochladen</a>
            </div>
            <div style={{ marginTop:8, color:'#9CA3AF', fontSize:12 }}>uploadId: {uploadId || '—'}</div>
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 12, padding: 16 }}>
            <DonutChart data={data} onSelect={(k) => setSelected(k)} />
          </div>
        )}
      </div>
      <div>
        {!empty && (
          <div style={{ background: '#fff', borderRadius: 12, padding: 16 }}>
            <MerchantBreakdown uploadId={uploadId} category={selected} />
          </div>
        )}
      </div>
    </div>
  );
}


