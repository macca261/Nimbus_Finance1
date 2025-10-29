import React from 'react';

export function Toast(props: { text: string }) {
  return (
    <div style={{ position: 'fixed', bottom: 16, right: 16, background: '#0F172A', color: '#fff', padding: '10px 14px', borderRadius: 8 }}>{props.text}</div>
  );
}


