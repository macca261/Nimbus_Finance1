import jschardet from 'jschardet';
import type { Dialect } from './schema';

function normalizeEncoding(enc: string): Dialect['encoding'] {
  const e = enc.toLowerCase();
  if (e.includes('utf-8')) return 'utf8';
  if (e.includes('utf8')) return 'utf8';
  if (e.includes('1252') || e.includes('windows')) return 'windows-1252';
  if (e.includes('iso-8859-1') || e.includes('latin1')) return 'iso-8859-1';
  return 'utf8';
}

export function detectDialect(sample: Uint8Array | Buffer): Dialect {
  const head = sample.subarray(0, 4096);
  const hasBom = head.length >= 3 && head[0] === 0xef && head[1] === 0xbb && head[2] === 0xbf;
  const encGuess = jschardet.detect(Buffer.from(head));
  const encoding = hasBom ? 'utf8-bom' : normalizeEncoding(encGuess.encoding || 'utf8');

  const text = Buffer.from(head).toString('latin1');

  const delimiters: Array<Dialect['delimiter']> = [';', ',', '\t'];
  let best: { d: Dialect['delimiter']; score: number; cols: number } = { d: ';', score: -1, cols: 0 };

  for (const d of delimiters) {
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0).slice(0, 50);
    const counts = lines.map((l) => (d === '\t' ? l.split('\t') : l.split(d)).length);
    if (counts.length === 0) continue;
    const mean = counts.reduce((a, b) => a + b, 0) / counts.length;
    const variance = counts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / counts.length;
    const score = mean - variance; // prefer stable column counts
    const cols = Math.round(mean);
    if (score > best.score) best = { d, score, cols };
  }

  // decimal/thousand heuristic
  const thousandCandidates: Array<Dialect['thousand']> = [',', '.', ''];
  let decimal: Dialect['decimal'] = ',';
  let thousand: Dialect['thousand'] = '.';
  const numberLike = /([\d\.,]+)[^\d]/g;
  const matches = text.matchAll(numberLike);
  let commaFreq = 0,
    dotFreq = 0;
  for (const m of matches) {
    const s = String(m[1]);
    commaFreq += (s.match(/,/g) || []).length;
    dotFreq += (s.match(/\./g) || []).length;
  }
  if (commaFreq >= dotFreq) {
    decimal = ',';
    thousand = dotFreq > 0 ? '.' : '';
  } else {
    decimal = '.';
    thousand = commaFreq > 0 ? ',' : '';
  }

  const delimiter = best.cols < 2 ? ';' : best.d;
  return { encoding, delimiter, decimal, thousand };
}


