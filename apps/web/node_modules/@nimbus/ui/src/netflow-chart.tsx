import React from 'react';

export function NetFlowChart(props: { points: Array<{ x: number; y: number }> }) {
  const w = 320, h = 80, pad = 8;
  const xs = props.points.map(p => p.x), ys = props.points.map(p => p.y);
  const xmin = Math.min(...xs, 0), xmax = Math.max(...xs, 1);
  const ymin = Math.min(...ys, 0), ymax = Math.max(...ys, 1);
  const scaleX = (x: number) => pad + ((x - xmin) / (xmax - xmin || 1)) * (w - pad * 2);
  const scaleY = (y: number) => h - pad - ((y - ymin) / (ymax - ymin || 1)) * (h - pad * 2);
  const d = props.points.map((p, i) => `${i ? 'L' : 'M'}${scaleX(p.x)},${scaleY(p.y)}`).join(' ');
  return (
    <svg width={w} height={h} role="img" aria-label="Net flow">
      <path d={d} fill="none" stroke="#3A66FF" strokeWidth={2} />
    </svg>
  );
}


