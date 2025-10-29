import React from 'react';

export function MerchantBars(props: { data: Array<{ name: string; total: number }>; max?: number }) {
  const max = props.max ?? Math.max(1, ...props.data.map((d) => d.total));
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {props.data.map((d) => (
        <div key={d.name} style={{ display: 'grid', gridTemplateColumns: '120px 1fr auto', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 12, color: '#334155' }}>{d.name}</div>
          <div style={{ background: '#E2E8F0', height: 8, borderRadius: 999 }}>
            <div style={{ width: `${(d.total / max) * 100}%`, background: '#3A66FF', height: 8, borderRadius: 999 }} />
          </div>
          <div style={{ fontSize: 12, color: '#334155' }}>{d.total.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</div>
        </div>
      ))}
    </div>
  );
}


