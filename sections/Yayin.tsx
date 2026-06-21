'use client';
import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, ScatterChart, Scatter, Cell,
} from 'recharts';
import { useFilteredData } from '@/hooks/useFilteredData';
import SectionHeader from '@/components/SectionHeader';
import EmptyState from '@/components/EmptyState';
import { KONUM_COLORS, KONUM_LABELS, Q_COLORS } from '@/lib/constants';
import type { Yayin } from '@/lib/types';
import rawData from '@/public/data/yayinlar.json';
const DATA = rawData as Yayin[];

export default function YayinSection() {
  const data = useFilteredData(DATA);
  const makaleler = useMemo(() => data.filter((d) => d.pub_type === 'makale'), [data]);
  const kitaplar  = useMemo(() => data.filter((d) => d.pub_type === 'kitap_bolumu'), [data]);

  // Q dağılımı × konum
  const qByKonum = useMemo(() => {
    const konumlar = ['merkez', 'yari_merkez', 'tasra'] as const;
    const qValues = ['Q1', 'Q2', 'Q3', 'Q4', 'Diğer'];
    const result: Record<string, Record<string, number>> = {};
    konumlar.forEach((k) => { result[k] = {}; qValues.forEach((q) => { result[k][q] = 0; }); });
    makaleler.forEach((y) => {
      const k = y.konum as string;
      if (result[k]) {
        const q = y.q_rank ?? 'Diğer';
        result[k][q] = (result[k][q] ?? 0) + 1;
      }
    });
    return konumlar.map((k) => ({ name: KONUM_LABELS[k], ...result[k] }));
  }, [makaleler]);

  // Q dağılımı × kurum türü
  const qByKurum = useMemo(() => {
    const kurumlar = ['devlet', 'vakif'] as const;
    const qValues = ['Q1', 'Q2', 'Q3', 'Q4', 'Diğer'];
    const result: Record<string, Record<string, number>> = {};
    kurumlar.forEach((k) => { result[k] = {}; qValues.forEach((q) => { result[k][q] = 0; }); });
    makaleler.forEach((y) => {
      const k = y.kurum_turu;
      const q = y.q_rank ?? 'Diğer';
      result[k][q] = (result[k][q] ?? 0) + 1;
    });
    return kurumlar.map((k) => ({ name: k === 'devlet' ? 'Devlet' : 'Vakıf', ...result[k] }));
  }, [makaleler]);

  // Yıllara göre yayın sayısı
  const yearData = useMemo(() => {
    const counts: Record<number, number> = {};
    makaleler.forEach((y) => {
      if (y.year) counts[y.year] = (counts[y.year] ?? 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => Number(a[0]) - Number(b[0])).map(([year, count]) => ({ year, count }));
  }, [makaleler]);

  // Scatter: atıf vs yayın sayısı (üniversite bazlı)
  const scatterData = useMemo(() => {
    const uniMap: Record<string, { cited: number; count: number; konum: string }> = {};
    data.forEach((y) => {
      const uni = (y as any).affiliations ?? 'Bilinmiyor';
      if (!uniMap[uni]) uniMap[uni] = { cited: 0, count: 0, konum: y.konum };
      uniMap[uni].count++;
      uniMap[uni].cited += (y.times_cited_wos ?? 0);
    });
    return Object.entries(uniMap).map(([name, d]) => ({ name, x: d.count, y: d.cited, konum: d.konum }));
  }, [data]);

  // En çok atıf alan 10 yayın
  const topCited = useMemo(() =>
    [...makaleler]
      .filter((y) => y.times_cited_wos != null)
      .sort((a, b) => (b.times_cited_wos ?? 0) - (a.times_cited_wos ?? 0))
      .slice(0, 10),
    [makaleler]
  );


  if (data.length === 0) return <EmptyState label="yayın" />;

  return (
    <div className="space-y-12">
      <SectionHeader
        title="Yayın & Bibliyometri"
        description="Web of Science'ta indekslenen makale ve kitap bölümlerinin Q sıralaması, atıf ve yıl analizleri."
        count={data.length}
        countLabel="yayın"
      />

      {/* Özet sayaçlar */}
      <div className="grid grid-cols-3 gap-4">
        <SummaryCard label="Makale" value={makaleler.length} color="#0D9488" />
        <SummaryCard label="Kitap Bölümü" value={kitaplar.length} color="#D97706" />
        <SummaryCard
          label="Toplam Atıf (WoS)"
          value={makaleler.reduce((s, y) => s + (y.times_cited_wos ?? 0), 0)}
          color="#7C3AED"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Q × Konum */}
        <ChartCard title="Q Sıralaması × Konum">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={qByKonum}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 8 }} />
              <Legend />
              {['Q1', 'Q2', 'Q3', 'Q4', 'Diğer'].map((q) => (
                <Bar key={q} dataKey={q} stackId="a" fill={Q_COLORS[q] ?? '#6B7280'} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Q × Kurum */}
        <ChartCard title="Q Sıralaması × Kurum Türü">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={qByKurum}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 8 }} />
              <Legend />
              {['Q1', 'Q2', 'Q3', 'Q4', 'Diğer'].map((q) => (
                <Bar key={q} dataKey={q} stackId="a" fill={Q_COLORS[q] ?? '#6B7280'} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Yıl trendi */}
      <ChartCard title="Yıllara Göre Makale Sayısı">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={yearData}>
            <XAxis dataKey="year" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 8 }} />
            <Bar dataKey="count" name="Makale" fill="#0D9488" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* En çok atıf alan yayınlar */}
      <ChartCard title="En Çok Atıf Alan 10 Makale">
        <div className="space-y-2 mt-2">
          {topCited.map((y, i) => (
            <div key={i} className="flex items-start gap-3 py-2 border-b border-slate-700/50 last:border-0">
              <span className="text-xs font-mono text-teal-500 w-4 shrink-0 mt-0.5">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-200 leading-relaxed truncate">{y.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{y.source} · {y.year}</p>
              </div>
              <span className="text-sm font-bold text-amber-400 shrink-0">{y.times_cited_wos}</span>
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
      <div className="text-2xl font-bold tabular-nums" style={{ color }}>{value.toLocaleString('tr-TR')}</div>
      <div className="text-sm text-slate-400 mt-1">{label}</div>
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
