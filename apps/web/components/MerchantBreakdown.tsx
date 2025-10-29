'use client';
import * as React from 'react';

export function MerchantBreakdown({ uploadId, category, currency = 'EUR' }: { uploadId: number; category: string; currency?: string }) {
  const [rows, setRows] = React.useState<{ name: string; total: number }[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    let alive = true;
    async function load() {
      if (!uploadId || !category) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/breakdown?uploadId=${uploadId}&category=${encodeURIComponent(category)}`, { cache: 'no-store' });
        const json = await res.json();
        if (alive && json.ok) setRows(json.merchants || []);
      } catch {
        if (alive) setRows([]);
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, [uploadId, category]);

  const fmt = new Intl.NumberFormat('de-DE', { style: 'currency', currency });

  if (!category) return null;

  return (
    <div style={{ padding: 8 }}>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>{category}</div>
      {loading && <div style={{ color: '#6B7280' }}>Lade Händler…</div>}
      {!loading && rows.length === 0 && <div style={{ color: '#6B7280' }}>Keine Händlerdaten.</div>}
      {rows.map((r, i) => (
        <div key={r.name + i} style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 600 }}>{r.name}</span>
            <span>
              {fmt.format(r.total)}
              <button
                onClick={async () => {
                  const cat = prompt('Kategorie für "' + r.name + '" (z.B. "Einkaufen", "ÖPNV/Bahn")');
                  if (!cat) return;
                  await fetch('/api/alias', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ alias: r.name, category: cat }) });
                  location.reload();
                }}
                style={{ marginLeft: 8, fontSize: 12 }}
              >
                Kategorisieren
              </button>
            </span>
          </div>
          <div style={{ height: 8, background: '#EEF2FF', borderRadius: 999, overflow: 'hidden', marginTop: 6 }}>
            <div style={{ height: 8, background: '#3A66FF', width: `${Math.min(100, Math.abs(r.total) / Math.abs(rows[0]?.total || 1) * 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}


