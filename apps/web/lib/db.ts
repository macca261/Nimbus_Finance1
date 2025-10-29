// db.ts — resilient SQLite repo with tiny circuit breaker + memory fallback
import fs from "node:fs";
import path from "node:path";

// ---- Circuit breaker (tiny, local) -----------------------------------------
type BreakerState = {
  openUntil: number;   // if Date.now() < openUntil -> breaker is OPEN
  failures: number[];  // timestamps (ms) of recent failures
  windowMs: number;    // lookback window
  threshold: number;   // failures needed to open
  openForMs: number;   // how long to stay open
};

const breaker: BreakerState = {
  openUntil: 0,
  failures: [],
  windowMs: 30_000,    // 30s
  threshold: 3,        // 3 write errors in window
  openForMs: 30_000,   // stay open 30s
};

function breakerIsOpen(): boolean {
  return Date.now() < breaker.openUntil;
}
function breakerRecordFailure(): void {
  const now = Date.now();
  // prune old failures
  breaker.failures = breaker.failures.filter((t) => now - t <= breaker.windowMs);
  breaker.failures.push(now);
  if (breaker.failures.length >= breaker.threshold) {
    breaker.openUntil = now + breaker.openForMs;
  }
}
function breakerRecordSuccess(): void {
  breaker.failures = [];
  breaker.openUntil = 0;
}

// ---- Optional native dep (better-sqlite3). Fallback to memory if missing. ---
let Database: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Database = require("better-sqlite3");
} catch {
  Database = null;
}

// ---- Files & dirs -----------------------------------------------------------
const dataDir = path.join(process.cwd(), ".data");
const dbPath = path.join(dataDir, "nimbus.db");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// ---- Domain types -----------------------------------------------------------
export type Row = {
  booking_date: string;
  amount: number;
  currency: string;
  ref_raw?: string;
  category?: string;
  subcategory?: string;
  merchant_id?: string;
};

let memoryUploadId = 0;
const memory: {
  uploads: Array<{ id: number; created_at: string; diagnostics_json: string; row_count: number; queued?: boolean }>;
  transactions: Array<Row & { upload_id: number; queued?: boolean }>;
} = { uploads: [], transactions: [] };

// ---- DB init ---------------------------------------------------------------
export let db: any = null;
if (Database) {
  try {
    db = new Database(dbPath);
  } catch {
    db = null;
  }
}

if (db) {
  db.pragma("journal_mode = WAL");
  db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT,
  tier TEXT,
  entitlements_json TEXT
);
CREATE TABLE IF NOT EXISTS uploads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  created_at TEXT,
  diagnostics_json TEXT,
  row_count INTEGER
);
CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  upload_id INTEGER,
  booking_date TEXT,
  amount REAL,
  currency TEXT,
  merchant_id TEXT,
  category TEXT,
  subcategory TEXT,
  ref_raw TEXT,
  iban_hash TEXT
);
CREATE TABLE IF NOT EXISTS merchants (
  id TEXT PRIMARY KEY,
  name TEXT
);
CREATE TABLE IF NOT EXISTS merchant_aliases (
  alias TEXT,
  merchant_id TEXT,
  user_id INTEGER
);
CREATE INDEX IF NOT EXISTS idx_tx_upload_cat ON transactions (upload_id, category);
CREATE INDEX IF NOT EXISTS idx_tx_merchant ON transactions (merchant_id);
CREATE INDEX IF NOT EXISTS idx_tx_booking ON transactions (booking_date);
`);
}

// ---- Health snapshot (readable by /api/health) -----------------------------
export function dbHealth() {
  const now = Date.now();
  return {
    dbLinked: Boolean(db),
    breakerOpen: breakerIsOpen(),
    breakerOpensForMs: Math.max(0, breaker.openUntil - now),
    recentFailures: breaker.failures.length,
  };
}

// ---- Writes (breaker-aware; never block user flow) -------------------------
export function insertUpload(diag: any, rowCount: number): number {
  // If DB not linked or breaker open, store in memory (non-blocking path)
  if (!db || breakerIsOpen()) {
    const id = ++memoryUploadId;
    memory.uploads.push({
      id,
      created_at: new Date().toISOString(),
      diagnostics_json: JSON.stringify(diag),
      row_count: rowCount,
      queued: !db || breakerIsOpen(),
    });
    return id;
  }
  try {
    const stmt = db.prepare(
      "INSERT INTO uploads (created_at, diagnostics_json, row_count) VALUES (?, ?, ?)"
    );
    const info = stmt.run(new Date().toISOString(), JSON.stringify(diag), rowCount);
    breakerRecordSuccess();
    return Number(info.lastInsertRowid);
  } catch {
    // DB hiccup: mark failure and fallback to memory
    breakerRecordFailure();
    const id = ++memoryUploadId;
    memory.uploads.push({
      id,
      created_at: new Date().toISOString(),
      diagnostics_json: JSON.stringify(diag),
      row_count: rowCount,
      queued: true,
    });
    return id;
  }
}

export function insertTransactions(uploadId: number, rows: Array<Row>) {
  // If DB not linked or breaker open, store in memory (non-blocking path)
  if (!db || breakerIsOpen()) {
    for (const r of rows) memory.transactions.push({ ...r, upload_id: uploadId, queued: !db || breakerIsOpen() });
    return;
  }
  try {
    const stmt = db.prepare(
      "INSERT INTO transactions (upload_id, booking_date, amount, currency, ref_raw, category, subcategory, merchant_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    );
    const tx = db.transaction((items: any[]) => {
      for (const r of items) {
        stmt.run(
          uploadId,
          r.booking_date,
          r.amount,
          r.currency,
          r.ref_raw ?? null,
          r.category ?? null,
          r.subcategory ?? null,
          r.merchant_id ?? null
        );
      }
    });
    tx(rows);
    breakerRecordSuccess();
  } catch {
    // Mark failure and fallback to memory
    breakerRecordFailure();
    for (const r of rows) memory.transactions.push({ ...r, upload_id: uploadId, queued: true });
  }
}

// ---- Reads (unchanged behaviour) -------------------------------------------
export function getCategoryTotals(uploadId: number): Array<{ key: string; total: number }> {
  if (db) {
    const rows = db
      .prepare(
        "SELECT category as key, SUM(amount) as total FROM transactions WHERE upload_id = ? AND category IS NOT NULL GROUP BY category"
      )
      .all(uploadId);
    return rows;
  }
  const map = new Map<string, number>();
  for (const r of memory.transactions.filter((t) => t.upload_id === uploadId && rCategory(t))) {
    const key = rCategory(r)!;
    const amt = typeof r.amount === 'string' ? Number(r.amount) : Number(r.amount ?? 0);
    map.set(key, (map.get(key) || 0) + (Number.isFinite(amt) ? amt : 0));
  }
  return Array.from(map, ([key, total]) => ({ key, total }));
}

export function getMerchantTotalsByCategory(
  uploadId: number,
  category: string
): Array<{ name: string; total: number }> {
  if (db) {
    const rows = db
      .prepare(
        "SELECT COALESCE(subcategory, merchant_id, ref_raw) as name, SUM(amount) as total FROM transactions WHERE upload_id = ? AND category = ? GROUP BY name ORDER BY total ASC"
      )
      .all(uploadId, category);
    return rows;
  }
  const map = new Map<string, number>();
  for (const r of memory.transactions.filter((t) => t.upload_id === uploadId && rCategory(t) === category)) {
    const name = r.subcategory || r.merchant_id || (r.ref_raw || '');
    const amt = typeof r.amount === 'string' ? Number(r.amount) : Number(r.amount ?? 0);
    map.set(name, (map.get(name) || 0) + (Number.isFinite(amt) ? amt : 0));
  }
  return Array.from(map, ([name, total]) => ({ name, total })).sort((a, b) => a.total - b.total);
}

function rCategory(r: Row): string | undefined {
  return r.category;
}

export function getLastUploadId(): number | null {
  if (db) {
    const row = db.prepare('SELECT id FROM uploads ORDER BY id DESC LIMIT 1').get();
    return row?.id ?? null;
  }
  const last = memory.uploads[memory.uploads.length - 1];
  return last?.id ?? null;
}
