import { z } from 'zod';

export const profileSchema = z.object({
  bank_id: z.string(),
  encodings: z.array(z.enum(['utf8', 'windows-1252', 'iso-8859-1']).or(z.literal('utf8-bom'))).min(1),
  delimiters: z.array(z.enum([';', ',', '\t'])).min(1),
  decimal: z.enum([',', '.']),
  thousand: z.enum([',', '.', '']).default('.'),
  date_formats: z.object({
    booking_date: z.array(z.string()).min(1),
    value_date: z.array(z.string()).optional().default([])
  }),
  headers: z.record(z.array(z.string())),
  rules: z.object({
    preamble_skip_until: z.string().optional(),
    invert_sign_if: z.array(z.string()).optional().default([]),
    credit_debit_columns: z.object({ credit: z.string(), debit: z.string() }).optional()
  }).optional().default({ invert_sign_if: [] }),
  source: z.object({ provider: z.string(), repo: z.string(), path: z.string() })
});

export type BankProfile = z.infer<typeof profileSchema>;


