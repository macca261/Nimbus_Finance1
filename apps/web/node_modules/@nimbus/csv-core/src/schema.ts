import { z } from 'zod';

export const txSchema = z.object({
  currency: z.string().length(3),
  booking_date: z.string().refine((s) => /^\d{4}-\d{2}-\d{2}$/.test(s), {
    message: 'booking_date must be ISO yyyy-MM-dd'
  }),
  value_date: z.string().refine((s) => /^\d{4}-\d{2}-\d{2}$/.test(s)).optional(),
  amount: z.number(),
  balance_after: z.number().optional(),
  counterparty_name: z.string().optional(),
  counterparty_iban: z.string().optional(),
  reference_raw: z.string().optional(),
  merchant_id: z.string().optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
  hash: z.string(),
  source_meta: z.record(z.any()).optional()
});

export type Tx = z.infer<typeof txSchema>;

export type Dialect = {
  encoding: 'utf8' | 'utf8-bom' | 'windows-1252' | 'iso-8859-1';
  delimiter: ';' | ',' | '\t';
  decimal: ',' | '.';
  thousand: ',' | '.' | '';
};

export type ParseWarning = {
  code: string;
  message: string;
  row?: number;
};

export type ParseDiagnostics = {
  rows: number;
  quarantined: number;
  columnsDetected?: number;
  sampleDialect?: Dialect;
  headerLine?: number;
};

export type ParseResult = {
  txs: Tx[];
  warnings: string[];
  diagnostics: ParseDiagnostics & Record<string, unknown>;
  quarantined_rows: string[];
};


