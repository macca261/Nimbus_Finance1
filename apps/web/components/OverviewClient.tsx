'use client';
import React from 'react';
import { StatCard, InsightsRail, WarningsDrawer, HealthGauge, AchievementsRow, GoalCard, NetFlowChart } from '@nimbus/ui';
import { DonutArea } from '@/components/DonutArea';

export function OverviewClient({ uploadId, categories }: { uploadId: number; categories: Array<{ key: string; total: number }> }) {
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <h1>Guten Morgen, Aaron 👋</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>
        <div style={{ display: 'grid', gap: 12 }}>
          <HealthGauge score={74} label="Gut" reasons={["Einnahmen > Ausgaben", "Sparquote 18%", "Budget 92%"]} />
          <AchievementsRow items={[{ label: 'No NSF', progress: 100 }, { label: 'On Budget', progress: 80 }, { label: 'Savings', progress: 60 }]} />
          <GoalCard title="Notgroschen" progress={42} />
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: 12 }}>
          <h3 style={{ marginTop: 0 }}>Chat</h3>
          <div style={{ fontSize: 12, color: '#475569', marginBottom: 8 }}>Vorschläge: „Wie waren meine Ausgaben?“ · „Welche Abos kündigen?“</div>
          <input aria-label="Chat" placeholder="Frage eingeben…" style={{ width: '100%', padding: 8, border: '1px solid #E2E8F0', borderRadius: 8 }} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12 }}>
        <StatCard title="Ausgaben diesen Monat" value="-1.486,51 €" />
        <StatCard title="Sicher zum Sparen" value="320,00 €" />
        <StatCard title="Nächste Rechnungen" value="3" />
        <StatCard title="Ziel-Fortschritt" value="42%" />
      </div>
      <div style={{ background: '#fff', borderRadius: 12, padding: 12 }}>
        <h3 style={{ margin: 0 }}>Nettofluss (14 Tage)</h3>
        <NetFlowChart points={Array.from({ length: 14 }, (_, i) => ({ x: i, y: Math.sin(i / 2) * 50 }))} />
      </div>
      <InsightsRail items={[{ label: 'Lebensmittel', value: '-15% MoM' }, { label: 'Strom', value: '+8% YoY' }, { label: 'ÖPNV', value: '+6€ vs Ø' }]} />
      <DonutArea uploadId={uploadId} categories={categories} />
      <WarningsDrawer warnings={[]} />
    </div>
  );
}


