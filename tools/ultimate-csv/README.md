ultimate-csv
==================================================

A cross-language CSV ingestion toolkit focused on bank statement normalization for the EU/Germany.

- Detects delimiter, encoding and header fingerprints without transmitting PII
- Normalizes to a shared NDJSON schema
- Applies categorization rules and merchant aliases
- Dedupe and recurrence detection
- Engines: Node.js (primary), Python (minimal), Go/C++ (buildable minimal)
- HTTP gateway and Docker compose for local runs

Quickstart

- Start the stack with Docker (node+python+gateway+redis):

```
pnpm run uc:dev
```

- In a separate shell, ingest a CSV against the gateway:

```
curl -s --data-binary @testdata/german/sparkasse_iso8859-1_semicolon.csv \
  'http://localhost:8080/ingest?lang=node&profile=auto&locale=de-DE&currency=EUR' | head
```

- Run tests (Node+Python):

```
pnpm -r --filter ./tools/ultimate-csv/node test
cd python && pytest -q
```

Environment Variables

- NO_REMOTE_PROFILES=1: disable fetching registry from GitHub
- REDIS_URL=redis://redis:6379/0: enable profile index caching for registry sync

Directory layout

See SPEC.md and services/http-openapi.yaml for API/format details.


