Header fingerprinting
==================================================

We hash:
- header tokens (uppercased, non-PII)
- delimiter
- encoding
- column count

Then compute a simhash for fuzzy matching against known profiles.


