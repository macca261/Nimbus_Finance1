import React, { useCallback, useState } from 'react';

export function UploadDropzone(props: { onFiles: (files: File[]) => void }) {
  const [drag, setDrag] = useState(false);
  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDrag(false);
      const files = Array.from(e.dataTransfer.files);
      props.onFiles(files);
    },
    [props]
  );
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={onDrop}
      style={{
        border: '2px dashed #94A3B8',
        padding: 24,
        textAlign: 'center',
        borderRadius: 12,
        background: drag ? '#F1F5F9' : 'transparent'
      }}
      role="region"
      aria-label="Upload"
    >
      <p>CSV hier ablegen oder klicken zum Auswählen</p>
      <input
        type="file"
        accept=".csv,text/csv"
        onChange={(e) => props.onFiles(Array.from(e.target.files ? Array.from(e.target.files) : [] as any))}
      />
    </div>
  );
}


