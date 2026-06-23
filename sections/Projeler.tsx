'use client';
import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { useFilteredData } from '@/hooks/useFilteredData';
import SectionHeader from '@/components/SectionHeader';
import EmptyState from '@/components/EmptyState';
import { PROJE_COLORS, KONUM_COLORS, KONUM_LABELS, TOPIC_LABELS, REGION_LABELS } from '@/lib/constants';
import type { Proje } from '@/lib/types';
import rawData from '@/public/data/projeler.json';
const DATA = rawData as Proje[];

export default function ProjelerSection() {
  const data = useFilteredData(DATA);

  // Proje türü dağılımı
  const turData = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach((p) => { counts[p.proje_turu] = (counts[p.proje_turu] ?? 0) + 1; });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value, color: PROJE_COLORS[name] ?? '#6B7280' }));
  }, [data]);

  // Konum × proje türü
  const konumByTur = useMemo(() => {
    const konumlar = ['merkez', 'yari_merkez', 'tasra'] as const;
    return konumlar.map((k) => {
      const kData = data.filter((p) => p.konum === k);
      const row: Record<string, unknown> = { name: KONUM_LABELS[k] };
      const types = ['COST', 'TÜBİTAK 1001', 'Erasmus+', 'Jean Monnet'];
      types.forEach((t) => { row[t] = kData.filter((p) => p.proje_turu === t).length; });
      return row;
    });
  }, [data]);

  // Konu kodları (normalize et, çöp/na filtrele, tümü göster)
  const topicData = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach((p) => p.topic_codes?.forEach((raw) => {
      const k = raw.trim().toUpperCase();
      if (TOPIC_LABELS[k]) counts[k] = (counts[k] ?? 0) + 1;
    }));
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([code, value]) => ({ code, name: `${code} (${TOPIC_LABELS[code]})`, value }));
  }, [data]);

  // Bölge kodları (normalize et, çöp/na filtrele, tümü göster)
  const regionData = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach((p) => p.region_codes?.forEach((raw) => {
      const b = raw.trim().toUpperCase();
      if (REGION_LABELS[b]) counts[b] = (counts[b] ?? 0) + 1;
    }));
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([code, value]) => ({ code, name: `${code} (${REGION_LABELS[code]})`, value }));
  }, [data]);

  // Yıl trendi (Erasmus+ / TÜBİTAK)
  const yearData = useMemo(() => {
    const counts: Record<number, Record<string, number>> = {};
    data.filter((p) => p.year).forEach((p) => {
      const y = p.year!;
      if (!counts[y]) counts[y] = {};
      counts[y][p.proje_turu] = (counts[y][p.proje_turu] ?? 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([year, v]) => ({ year, ...v }));
  }, [data]);


  if (data.length === 0) return <EmptyState label="proje" />;

  return (
    <div className="space-y-12">
      <SectionHeader
        title="Projeler"
        description="COST, TÜBİTAK 1001, Jean Monnet ve Erasmus+ projeleri; konu, bölge ve konum dağılımı."
        count={data.length}
        countLabel="proje"
      />

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Proje türü pie */}
        <ChartCard title="Proje Türü Dağılımı">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={turData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                {turData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Konum × tür */}
        <ChartCard title="Proje Türü × Konum">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={konumByTur}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 8 }} />
              <Legend />
              {['COST', 'TÜBİTAK 1001', 'Erasmus+', 'Jean Monnet'].map((t) => (
                <Bar key={t} dataKey={t} stackId="a" fill={PROJE_COLORS[t] ?? '#6B7280'} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Konu kodları */}
        <ChartCard title="En Çok Çalışılan Konular">
          <ResponsiveContainer width="100%" height={Math.max(280, topicData.length * 28)}>
            <BarChart data={topicData} layout="vertical" margin={{ left: 280, right: 30 }}>
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#94A3B8' }} width={280} />
              <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 8 }} />
              <Bar dataKey="value" fill="#059669" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Bölge kodları */}
        <ChartCard title="Hedeflenen Bölgeler">
          <ResponsiveContainer width="100%" height={Math.max(260, regionData.length * 28)}>
            <BarChart data={regionData} layout="vertical" margin={{ left: 240, right: 30 }}>
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#94A3B8' }} width={240} />
              <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 8 }} />
              <Bar dataKey="value" fill="#D97706" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {yearData.length > 0 && (
        <ChartCard title="Yıllara Göre Proje Sayısı">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={yearData}>
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 8 }} />
              <Legend />
              {['Erasmus+', 'TÜBİTAK 1001', 'Jean Monnet'].map((t) => (
                <Bar key={t} dataKey={t} stackId="a" fill={PROJE_COLORS[t] ?? '#6B7280'} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-slate-300 mb-4">{title}</h3>
      {children}
    </div>
  );
}
