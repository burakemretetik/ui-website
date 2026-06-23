'use client';
import { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useFilteredData } from '@/hooks/useFilteredData';
import SectionHeader from '@/components/SectionHeader';
import EmptyState from '@/components/EmptyState';
import type { DersKaydi, Seviye } from '@/lib/types';
import rawData from '@/public/data/mufredat.json';
const DATA = rawData as DersKaydi[];

const SEVIYE_COLORS: Record<Seviye, string> = {
  'Lisans':        '#0D9488',
  'Yüksek Lisans': '#D97706',
  'Doktora':       '#7C3AED',
};

export default function MufredatSection() {
  const data = useFilteredData(DATA);
  const [seviye, setSeviye] = useState<Seviye | 'Tümü'>('Tümü');

  const filtered = useMemo(() =>
    seviye === 'Tümü' ? data : data.filter((d) => d.seviye === seviye),
    [data, seviye]
  );

  // En sık geçen dersler
  const topDersler = useMemo(() => {
    const counts: Record<string, { count: number; totalAkts: number }> = {};
    filtered.forEach((d) => {
      if (!counts[d.ders_adi]) counts[d.ders_adi] = { count: 0, totalAkts: 0 };
      counts[d.ders_adi].count++;
      counts[d.ders_adi].totalAkts += d.akts ?? 0;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 20)
      .map(([ders, { count, totalAkts }]) => ({
        ders: ders.length > 45 ? ders.slice(0, 45) + '…' : ders,
        count,
        avgAkts: count > 0 ? +(totalAkts / count).toFixed(1) : 0,
      }));
  }, [filtered]);

  // Seviye dağılımı
  const seviyeStats = useMemo(() => {
    const s: Record<string, number> = { Lisans: 0, 'Yüksek Lisans': 0, Doktora: 0 };
    data.forEach((d) => { s[d.seviye] = (s[d.seviye] ?? 0) + 1; });
    return Object.entries(s).map(([name, value]) => ({ name, value }));
  }, [data]);

  // Program türü (Uİ vs SBUİ)
  const programData = useMemo(() => {
    const counts: Record<string, number> = {};
    filtered.forEach((d) => {
      const p = d.program?.includes('Siyaset') ? 'SBUİ' : 'Uİ';
      counts[p] = (counts[p] ?? 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filtered]);


  if (data.length === 0) return <EmptyState label="ders kaydı" />;

  return (
    <div className="space-y-12">
      <SectionHeader
        title="Müfredat Analizi"
        description="4.797 ders kaydı üzerinden en yaygın dersler, AKTS ağırlıkları ve program düzeyi karşılaştırması."
        count={filtered.length}
        countLabel="ders kaydı"
      />

      {/* Seviye seçici */}
      <div className="flex gap-2">
        {(['Tümü', 'Lisans', 'Yüksek Lisans', 'Doktora'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSeviye(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
              seviye === s
                ? 'text-white border-transparent bg-teal-600'
                : 'border-slate-600 text-slate-400 hover:border-slate-400'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Seviye dağılımı */}
        <ChartCard title="Ders Seviyesi Dağılımı">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={seviyeStats}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis interval={0} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 8 }} />
              <Bar dataKey="value" name="Ders Sayısı" radius={[4, 4, 0, 0]}>
                {seviyeStats.map((entry) => (
                  <Cell key={entry.name} fill={SEVIYE_COLORS[entry.name as Seviye] ?? '#6B7280'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Program türü */}
        <ChartCard title="Program Türü Dağılımı">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={programData}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 8 }} />
              <Bar dataKey="value" name="Ders" fill="#D97706" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* En sık dersler */}
      <ChartCard title={`En Sık Görülen 20 Ders${seviye !== 'Tümü' ? ` (${seviye})` : ''}`}>
        <ResponsiveContainer width="100%" height={520}>
          <BarChart data={topDersler} layout="vertical" margin={{ left: 290, right: 30 }}>
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis interval={0} type="category" dataKey="ders" width={290} tick={(props: any) => (<text x={props.x - 5} y={props.y} dy={3} textAnchor="end" fill="#94A3B8" fontSize={10}>{props.payload.value}</text>)} />
            <Tooltip
              contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 8 }}
              formatter={(v: unknown, name: unknown) => [v as number, (name as string) === 'count' ? 'Üniversite Sayısı' : 'Ort. AKTS']}
            />
            <Bar dataKey="count" name="count" fill="#0D9488" radius={[0, 4, 4, 0]}>
              {topDersler.map((_, i) => (
                <Cell key={i} fill={`hsl(172, ${75 - i * 2}%, ${45 - i}%)`} />
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
