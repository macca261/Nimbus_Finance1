import React from 'react';
import './styles.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body style={{ background: '#F7F9FC', color: '#0F172A' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', minHeight: '100vh' }}>
          <aside style={{ padding: 16, borderRight: '1px solid #E2E8F0' }}>
            <div style={{ fontWeight: 800, color: '#3A66FF', marginBottom: 16 }}>Nimbus</div>
            <nav>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
                <li><a href="/">Overview</a></li>
                <li><a href="/upload">Imports</a></li>
                <li><a href="/categories">Categories</a></li>
                <li><a href="/goals">Goals</a></li>
                <li><a href="/subscriptions">Subscriptions</a></li>
                <li><a href="/reports">Reports</a></li>
                <li><a href="/settings">Settings</a></li>
              </ul>
            </nav>
          </aside>
          <main style={{ padding: 24 }}>{children}</main>
        </div>
      </body>
    </html>
  );
}


