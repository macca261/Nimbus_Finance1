'use client';
import React, { useState } from 'react';

export default function SettingsPage() {
  const [tier, setTier] = useState<string>(typeof document !== 'undefined' ? (document.cookie.match(/(?:^|; )demo_tier=([^;]+)/)?.[1] || 'free') : 'free');
  function onTierChange(t: string) {
    document.cookie = `demo_tier=${t}; path=/; max-age=31536000`;
    setTier(t);
  }
  return (
    <div>
      <h1>Einstellungen</h1>
      <div style={{ display: 'grid', gap: 8 }}>
        <label>Tier & Entitlements</label>
        <select value={tier} onChange={(e) => onTierChange(e.target.value)}>
          <option value="free">Free</option>
          <option value="proLite">Pro Lite</option>
          <option value="proPlus">Pro Plus</option>
        </select>
        <p style={{ fontSize: 12, color: '#334155' }}>Free: Rohdaten werden nach 24h automatisch gelöscht.</p>
        <button>Export CSV</button>
        <button>Meine Daten löschen (Stub)</button>
      </div>
    </div>
  );
}


