'use client';
import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { useFilteredData } from '@/hooks/useFilteredData';
import SectionHeader from '@/components/SectionHeader';
import EmptyState from '@/components/EmptyState';
import { KONUM_COLORS, KONUM_LABELS } from '@/lib/constants';
import type { Kontenjan } from '@/lib/types';
import rawData from '@/public/data/kontenjanlar.json';
const DATA = rawData as Kontenjan[];

export default function KontenjanSection() {
  const data = useFilteredData(DATA);

  // Yıllık toplam kontenjan (konum bazlı)
  const yearlyByKonum = useMemo(() => {
    const years = [2021, 2022, 2023, 2024, 2025];
    return years.map((year) => {
      const yearData = data.filter((d) => d.year === year);
      const row: Record<string, unknown> = { year };
      (['merkez', 'yari_merkez', 'tasra'] as const).forEach((k) => {
        row[k] = yearData.filter((d) => d.konum === k).reduce((s, d) => s + d.kontenjan, 0);
      });
      row.toplam = yearData.reduce((s, d) => s + d.kontenjan, 0);
      return row;
    });
  }, [data]);

  // Yıllık toplam trend (line chart için)
  const yearlyTrend = useMemo(() =>
    yearlyByKonum.map((r) => ({ year: r.year, toplam: r.toplam })),
    [yearlyByKonum]
  );

  // Devlet vs Vakıf karşılaştırması
  const kurumYearly = useMemo(() => {
    const years = [2021, 2022, 2023, 2024, 2025];
    return years.map((year) => {
      const yearData = data.filter((d) => d.year === year);
      return {
        year,
        devlet: yearData.filter((d) => d.kurum_turu === 'devlet').reduce((s, d) => s + d.kontenjan, 0),
        vakif:  yearData.filter((d) => d.kurum_turu === 'vakif').reduce((s, d) => s + d.kontenjan, 0),
      };
    });
  }, [data]);

  // En büyük bölümler (2025 yılı)
  const top2025 = useMemo(() => {
    return data
      .filter((d) => d.year === 2025)
      .sort((a, b) => b.kontenjan - a.kontenjan)
      .slice(0, 15);
  }, [data]);

  const total2025 = useMemo(() => data.filter((d) => d.year === 2025).reduce((s, d) => s + d.kontenjan, 0), [data]);


  if (data.length === 0) return <EmptyState label="kontenjan kaydı" />;

  return (
    <div className="space-y-12">
      <SectionHeader
        title="Kontenjan Analizi"
        description="2021–2025 yılları arasında Uİ ve SBUİ programlarına alınan öğrenci kontenjanlarının trendi."
        count={total2025}
        countLabel="2025 toplam kontenjan"
      />

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Konum × Yıl */}
        <ChartCard title="Yıllık Kontenjan (Konum Bazlı, Yığılmış)">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={yearlyByKonum}>
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 8 }} />
              <Legend />
              {(['merkez', 'yari_merkez', 'tasra'] as const).map((k) => (
                <Bar key={k} dataKey={k} name={KONUM_LABELS[k]} stackId="a" fill={KONUM_COLORS[k]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Devlet vs Vakıf */}
        <ChartCard title="Devlet vs Vakıf Kontenjanı">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={kurumYearly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 8 }} />
              <Legend />
              <Line type="monotone" dataKey="devlet" name="Devlet" stroke="#1D4ED8" strokeWidth={2} dot />
              <Line type="monotone" dataKey="vakif"  name="Vakıf"  stroke="#7C3AED" strokeWidth={2} dot />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Toplam trend */}
      <ChartCard title="Toplam Kontenjan Trendi (Tüm Kategoriler)">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={yearlyTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="year" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 8 }} />
            <Line type="monotone" dataKey="toplam" name="Toplam Kontenjan" stroke="#0D9488" strokeWidth={2} dot />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* En büyük bölümler */}
      <ChartCard title="2025 Yılı En Yüksek Kontenjanlı Bölümler">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={top2025} layout="vertical" margin={{ left: 280, right: 40 }}>
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="bolum" tick={{ fontSize: 10, fill: '#94A3B8' }} width={280} />
            <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 8 }} />
            <Bar dataKey="kontenjan" name="Kontenjan" fill="#0D9488" radius={[0, 4, 4, 0]} />
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
