'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { UploadDropzone } from '@nimbus/ui';

export default function UploadPage() {
  const [status, setStatus] = React.useState<string>('');
  const router = useRouter();

  async function onFiles(files: File[]) {
    const file = files[0];
    if (!file) return;

    try {
      setStatus('Parsing…');
      // send raw bytes (your route reads arrayBuffer → Buffer)
      const buf = new Uint8Array(await file.arrayBuffer());
      const res = await fetch('/api/ingest', { method: 'POST', body: buf });
      const json = await res.json();

      if (!res.ok || !json.ok) {
        setStatus('Fehler: ' + (json.error || json.warnings?.[0] || 'Unbekannt'));
        return;
      }

      setStatus('Fertig! Aktualisiere Dashboard…');
      // Redirect to Dashboard with uploadId so UI can refresh
      if (json.uploadId) {
        router.push(`/?uploadId=${json.uploadId}`);
      } else {
        // no uploadId (DB was down) — still refresh to show computed categories
        router.push('/?uploadId=latest');
      }
      router.refresh();
    } catch (err: any) {
      setStatus('Fehler: ' + String(err?.message || err));
    }
  }

  return (
    <div style={{ maxWidth: 680, margin: '40px auto', padding: 24, background: '#fff', border: '1px solid #E6E9F2', borderRadius: 12 }}>
      <h1 style={{ marginTop: 0 }}>CSV hochladen</h1>
      <p>Wir erkennen Encoding, Delimiter und Dezimal-Komma automatisch. Große Dateien brauchen einen Moment.</p>
      <UploadDropzone onFiles={onFiles} />
      {status && <div style={{ marginTop: 12, color: '#6B7280' }}>{status}</div>}
    </div>
  );
}
