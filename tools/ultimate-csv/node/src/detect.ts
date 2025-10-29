import iconv from 'iconv-lite';

export type Detection = {
  delimiter: ';' | ',' | '\t';
  encoding: 'utf8' | 'win1252' | 'latin1';
  col_count: number;
  header_tokens: string[];
  fingerprint: string;
};

export function detect(buf: Buffer): Detection {
  const sample = buf.subarray(0, Math.min(buf.length, 64 * 1024));
  // encoding guess: BOM or bytes > 0x7F hint at win1252/latin1
  let encoding: Detection['encoding'] = 'utf8';
  if (sample[0] === 0xEF && sample[1] === 0xBB && sample[2] === 0xBF) encoding = 'utf8';
  else if (sample.some((b) => b >= 0x80 && b <= 0x9F)) encoding = 'win1252';
  else if (sample.some((b) => b >= 0x80)) encoding = 'latin1';

  const text = iconv.decode(sample, encoding === 'utf8' ? 'utf8' : encoding === 'win1252' ? 'win1252' : 'latin1');
  const counts = {
    ';': (text.match(/;/g) || []).length,
    ',': (text.match(/,/g) || []).length,
    '\t': (text.match(/\t/g) || []).length,
  } as Record<'|' | ';' | ',' | '\t', number> as any;
  const delimiter: Detection['delimiter'] = (Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] as any) || ';';
  const header = text.split(/\r?\n/, 1)[0] || '';
  const header_tokens = header.split(delimiter).map((s) => s.trim().toUpperCase());
  const col_count = header_tokens.length;
  const fingerprint = simhash(header_tokens.join('|') + '|' + delimiter + '|' + encoding + '|' + col_count);
  return { delimiter, encoding, col_count, header_tokens, fingerprint };
}

export function simhash(s: string): string {
  let x = 0n;
  for (let i = 0; i < s.length; i++) x = (x << 5n) - x + BigInt(s.charCodeAt(i));
  return (x & ((1n << 64n) - 1n)).toString(16).padStart(16, '0');
}


