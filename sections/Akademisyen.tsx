'use client';
import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, Cell, PieChart, Pie,
} from 'recharts';
import { useFilteredData } from '@/hooks/useFilteredData';
import SectionHeader from '@/components/SectionHeader';
import { KONUM_COLORS, KONUM_LABELS, TOPIC_LABELS, REGION_LABELS, UNVAN_ORDER } from '@/lib/constants';
import type { Akademisyen } from '@/lib/types';
import EmptyState from '@/components/EmptyState';

// Veriyi JSON'dan yükle (build-time, statik)
import rawData from '@/public/data/akademisyenler.json';
const DATA = rawData as Akademisyen[];

const CINSIYET_COLORS: Record<string, string> = {
  Erkek: '#3B82F6',
  Kadın: '#EC4899',
  Bilinmiyor: '#6B7280',
};

export default function AkademisyenSection() {
  const data = useFilteredData(DATA);

  // — Cinsiyet dağılımı
  const genderData = useMemo(() => {
    const counts: Record<string, number> = { Erkek: 0, Kadın: 0, Bilinmiyor: 0 };
    data.forEach((a) => {
      const key = a.cinsiyet ?? 'Bilinmiyor';
      counts[key] = (counts[key] ?? 0) + 1;
    });
    return Object.entries(counts)
      .filter(([, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));
  }, [data]);

  // — Unvan dağılımı (‘Diğer’ hariç)
  const unvanData = useMemo(() => {
    const grouped: Record<string, Record<string, number>> = {};
    UNVAN_ORDER.filter((u) => u !== 'Diğer').forEach((u) => { grouped[u] = { merkez: 0, yari_merkez: 0, tasra: 0 }; });
    data.forEach((a) => {
      if (a.unvan !== 'Diğer' && grouped[a.unvan]) grouped[a.unvan][a.konum] = (grouped[a.unvan][a.konum] ?? 0) + 1;
    });
    return UNVAN_ORDER
      .filter((u) => u !== 'Diğer')
      .map((u) => ({ name: u, ...grouped[u] }))
      .filter((r) => Object.values(r).slice(1).some((v) => (v as unknown as number) > 0));
  }, [data]);

  // — Konu kodları (normalize et, çöp/na filtrele, tümü göster)
  const topicData = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach((a) => a.topic_codes?.forEach((raw) => {
      const k = raw.trim().toUpperCase();
      if (TOPIC_LABELS[k]) counts[k] = (counts[k] ?? 0) + 1;
    }));
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([code, value]) => ({ code, name: `${code} (${TOPIC_LABELS[code]})`, value }));
  }, [data]);

  // — Bölge kodları (normalize et, çöp/na filtrele, tümü göster)
  const regionData = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach((a) => a.region_codes?.forEach((raw) => {
      const b = raw.trim().toUpperCase();
      if (REGION_LABELS[b]) counts[b] = (counts[b] ?? 0) + 1;
    }));
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([code, value]) => ({ code, name: `${code} (${REGION_LABELS[code]})`, value }));
  }, [data]);

  // — Konum dağılımı (pie)
  const konumData = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach((a) => { counts[a.konum] = (counts[a.konum] ?? 0) + 1; });
    return Object.entries(counts).map(([key, value]) => ({
      name: KONUM_LABELS[key] ?? key,
      value,
      color: KONUM_COLORS[key] ?? '#6B7280',
    }));
  }, [data]);

  const total = data.length;


  if (data.length === 0) return <EmptyState label="akademisyen" />;

  return (
    <div className="space-y-12">
      <SectionHeader
        title="Akademisyen Haritası"
        description="Türkiye'deki Uİ ve SBUİ bölümlerinde görev yapan akademisyenlerin cinsiyet, unvan, araştırma konusu ve bölge dağılımı."
        count={total}
        countLabel="akademisyen"
      />

      {/* Özet satırı */}
      <div className="grid grid-cols-3 gap-4">
        {konumData.map((d) => (
          <div key={d.name} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="text-2xl font-bold" style={{ color: d.color }}>{d.value.toLocaleString('tr-TR')}</div>
            <div className="text-sm text-slate-400 mt-1">{d.name}</div>
            <div className="text-xs text-slate-600 mt-0.5">
              %{total > 0 ? ((d.value / total) * 100).toFixed(1) : 0}
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">

        {/* Cinsiyet */}
        <ChartCard title="Cinsiyet Dağılımı">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={genderData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {genderData.map((entry) => (
                  <Cell key={entry.name} fill={CINSIYET_COLORS[entry.name] ?? '#6B7280'} />
                ))}
              </Pie>
              <Tooltip formatter={(v: unknown) => [v as number, 'Akademisyen']} contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Unvan × Konum */}
        <ChartCard title="Unvan Dağılımı (Konum Bazlı)">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={unvanData} layout="vertical" margin={{ left: 290, right: 30 }}>
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis interval={0} type="category" dataKey="name" width={290} tick={(props: any) => (<text x={props.x - 5} y={props.y} dy={3} textAnchor="end" fill="#94A3B8" fontSize={10}>{props.payload.value}</text>)} />
              <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 8 }} />
              <Legend />
              {(['merkez', 'yari_merkez', 'tasra'] as const).map((k) => (
                <Bar key={k} dataKey={k} name={KONUM_LABELS[k]} stackId="a" fill={KONUM_COLORS[k]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

      </div>

      {/* Araştırma Konuları */}
      <ChartCard title="En Çok Çalışılan Konular">
        <ResponsiveContainer width="100%" height={Math.max(300, topicData.length * 28)}>
          <BarChart data={topicData} layout="vertical" margin={{ left: 290, right: 30 }}>
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis interval={0} type="category" dataKey="name" width={290} tick={(props: any) => (<text x={props.x - 5} y={props.y} dy={3} textAnchor="end" fill="#94A3B8" fontSize={10}>{props.payload.value}</text>)} />
            <Tooltip
              formatter={(v: unknown) => [v as number, 'Akademisyen']}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.code ?? ''}
              contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 8 }}
            />
            <Bar dataKey="value" fill="#0D9488" radius={[0, 4, 4, 0]}>
              {topicData.map((entry, i) => (
                <Cell key={i} fill={`hsl(${172 + i * 8}, 70%, ${45 - i * 1.5}%)`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Bölgeler */}
      <ChartCard title="En Çok Çalışılan Bölgeler">
        <ResponsiveContainer width="100%" height={Math.max(280, regionData.length * 28)}>
          <BarChart data={regionData} layout="vertical" margin={{ left: 290, right: 30 }}>
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis interval={0} type="category" dataKey="name" width={290} tick={(props: any) => (<text x={props.x - 5} y={props.y} dy={3} textAnchor="end" fill="#94A3B8" fontSize={10}>{props.payload.value}</text>)} />
            <Tooltip
              formatter={(v: unknown) => [v as number, 'Akademisyen']}
              contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 8 }}
            />
            <Bar dataKey="value" fill="#D97706" radius={[0, 4, 4, 0]}>
              {regionData.map((entry, i) => (
                <Cell key={i} fill={`hsl(${38 + i * 5}, 80%, ${45 - i * 1.5}%)`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

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
