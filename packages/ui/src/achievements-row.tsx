import React from 'react';

export function AchievementsRow(props: { items: Array<{ label: string; progress: number }> }) {
  return (
    <div style={{ display: 'flex', gap: 12 }}>
      {props.items.map((i) => (
        <div key={i.label} style={{ background: '#fff', borderRadius: 12, padding: 12, display: 'grid', justifyItems: 'center', width: 100 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', border: '6px solid #3A66FF', position: 'relative' }} />
          <div style={{ fontSize: 12, color: '#334155' }}>{i.label}</div>
        </div>
      ))}
    </div>
  );
}


