import React from 'react';

export function WarningsDrawer(props: { warnings: Array<{ code: string; message: string; row?: number }> }) {
  if (!props.warnings.length) return null;
  return (
    <details open style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 8, padding: 12 }}>
      <summary style={{ cursor: 'pointer', color: '#9A3412' }}>Warnungen ({props.warnings.length})</summary>
      <ul>
        {props.warnings.map((w, i) => (
          <li key={i} style={{ color: '#9A3412', fontSize: 12 }}>
            [{w.code}] {w.message} {w.row ? `(Zeile ${w.row})` : ''}
          </li>
        ))}
      </ul>
    </details>
  );
}


