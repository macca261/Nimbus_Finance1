Security and Privacy
==================================================

Threat model

- CSVs often contain PII: names, IBANs, addresses.
- Detection runs locally and only emits header fingerprints (no PII).
- Registry fetch can be disabled with NO_REMOTE_PROFILES=1.

Telemetry limits

- No default telemetry; optional HTTP logs include only fingerprint metadata.

IBAN handling

- IBANs are normalized (uppercase, no spaces) and hashed into account_id.
- Never log or transmit raw IBAN values.


