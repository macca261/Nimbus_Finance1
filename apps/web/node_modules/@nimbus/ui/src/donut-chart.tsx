import React from 'react';

export type DonutSlice = { key: string; value: number; color: string };

export function DonutChart(props: {
  size?: number;
  thickness?: number;
  data: DonutSlice[];
  onSelect?: (key: string) => void;
}) {
  const size = props.size ?? 200;
  const thickness = props.thickness ?? 24;
  const radius = size / 2;
  const circumference = 2 * Math.PI * (radius - thickness / 2);
  const total = props.data.reduce((a, b) => a + b.value, 0) || 1;
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Donut chart">
      <g transform={`translate(${radius}, ${radius})`}>
        {props.data.map((s) => {
          const length = (s.value / total) * circumference;
          const dashArray = `${length} ${circumference - length}`;
          const circle = (
            <circle
              key={s.key}
              r={radius - thickness / 2}
              cx={0}
              cy={0}
              fill="transparent"
              stroke={s.color}
              strokeWidth={thickness}
              strokeDasharray={dashArray}
              strokeDashoffset={-offset}
              onClick={() => props.onSelect?.(s.key)}
              style={{ cursor: props.onSelect ? 'pointer' : 'default' }}
            />
          );
          offset += length;
          return circle;
        })}
      </g>
    </svg>
  );
}


