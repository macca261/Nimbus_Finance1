Registry mirror
==================================================

This folder contains helpers to mirror bank profiles from an external repo (e.g. `csv-bank-profiles`).

- `sync_registry.py` fetches YAML profiles via GitHub APIs and builds `profiles_index.json` keyed by header simhash.
- `validate_profiles.py` validates required fields.

Set `NO_REMOTE_PROFILES=1` to skip remote fetch.


