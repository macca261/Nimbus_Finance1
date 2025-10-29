import dayjs from 'dayjs';

export function toISODate(s: string, fmt: string): string {
  if (fmt === 'dd.MM.yyyy') {
    const m = s.match(/(\d{2})\.(\d{2})\.(\d{4})/);
    if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const d = dayjs(s);
  return d.isValid() ? d.format('YYYY-MM-DD') : '';
}

export function toNumberDE(v: unknown): number {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  if (typeof v !== 'string') return 0;
  let s = v.trim();
  if (!s) return 0;
  s = s.replace(/\s+/g, '');
  s = s.replace(/\u2212/g, '-');
  s = s.replace(/[€A-Za-z]/g, '');
  const neg = /^\(.*\)$/.test(s);
  if (neg) s = s.slice(1, -1);
  const lastComma = s.lastIndexOf(',');
  if (lastComma !== -1) {
    s = s.replace(/\./g, '');
    s = s.slice(0, lastComma).replace(/,/g, '') + '.' + s.slice(lastComma + 1);
  } else {
    const dots = (s.match(/\./g) || []).length;
    if (dots > 1) s = s.replace(/\./g, '');
  }
  s = s.replace(/^-?\./, (m) => (m.startsWith('-') ? '-0.' : '0.'));
  const n = Number(s);
  return Number.isFinite(n) ? (neg ? -n : n) : 0;
}


