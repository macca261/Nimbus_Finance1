import React from 'react';

export function GoalCard(props: { title: string; progress: number }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: 16 }}>
      <div style={{ fontWeight: 700 }}>{props.title}</div>
      <div style={{ height: 8, background: '#E2E8F0', borderRadius: 999, marginTop: 8 }}>
        <div style={{ width: `${Math.max(0, Math.min(100, props.progress))}%`, height: 8, background: '#13D8A3', borderRadius: 999 }} />
      </div>
    </div>
  );
}


