import React from 'react';

export function HealthGauge(props: { score: number; label: string; reasons?: string[] }) {
  const score = Math.max(0, Math.min(100, props.score));
  const color = score >= 80 ? '#13D8A3' : score >= 60 ? '#FFC646' : '#EF4444';
  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', border: `8px solid ${color}`, display: 'grid', placeItems: 'center', fontWeight: 700 }}>{score}</div>
        <div>
          <div style={{ fontWeight: 700 }}>{props.label}</div>
          <div style={{ fontSize: 12, color: '#475569' }}>{props.reasons?.slice(0,3).join(' · ')}</div>
        </div>
      </div>
    </div>
  );
}


