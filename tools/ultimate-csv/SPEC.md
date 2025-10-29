Ultimate CSV SPEC
==================================================

Schema (NDJSON per line)

Fields:
- booking_date: YYYY-MM-DD (derived from dd.MM.yyyy where needed)
- value_date?: YYYY-MM-DD
- amount: number (EUR decimal, DE format parsing supported)
- currency: string (e.g. EUR)
- direction: "debit" | "credit"
- counterparty_name?: string
- counterparty_iban?: string (uppercase, no spaces)
- reference?: string
- merchant_id?: string (normalized)
- merchant_name?: string (display)
- category: string
- subcategory?: string
- account_id: string (stable hash of IBAN+bank+last4)
- source: "csv" | "ais"
- raw_hash: sha256 of canonicalized raw row
- is_recurring: boolean
- ingest_notes: string[]

Normalization Rules

- Decimal comma and thousands: supports −1.234,56 €, (1.234,56), NBSP
- Dates dd.MM.yyyy → YYYY-MM-DD
- IBAN uppercased and spaces removed
- Direction inferred from sign of amount (negative → debit)
- Account ID: sha256(IBAN|BANK|LAST4)
- Dedupe key: sha256(booking_date|value_date|amount|currency|counterparty_name|reference|account_id)
- Recurrence heuristic: repeating amounts within ±30% on monthly/weekly windows

Detection

- 64KB sample
- Delimiter: semicolon, comma, tab (count wins)
- Encoding: UTF-8/BOM, Windows-1252, ISO-8859-1 (via BOM + heuristic byte ranges)
- Header fingerprint: tokens + delimiter + encoding + col_count + simhash
- Never transmit PII: only header tokens and fingerprint allowed out-of-box

Categorization

- rules-first via common/rules/category_rules.yaml
- merchant aliases via common/rules/merchant_aliases.yaml

Examples

German:
- "01.07.2024;EDEKA;−12,34 €;..." → amount -12.34, direction debit, category Einkaufen


