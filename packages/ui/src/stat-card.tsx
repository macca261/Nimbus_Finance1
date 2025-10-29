import React from 'react';
import { colors } from './tokens';

export function StatCard(props: { title: string; value: string; hint?: string }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
      <div style={{ color: colors.slate, fontSize: 13, opacity: 0.8 }}>{props.title}</div>
      <div style={{ color: colors.slate, fontSize: 24, fontWeight: 700 }}>{props.value}</div>
      {props.hint && <div style={{ color: '#64748B', fontSize: 12 }}>{props.hint}</div>}
    </div>
  );
}


