import React from 'react';

export function InsightsRail(props: { items: Array<{ label: string; value: string }> }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {props.items.map((i) => (
        <span key={i.label} style={{ background: '#EEF2FF', color: '#1E3A8A', borderRadius: 999, padding: '6px 10px', fontSize: 12 }}>
          {i.label}: {i.value}
        </span>
      ))}
    </div>
  );
}


