'use client';
import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
import { useFilteredData } from '@/hooks/useFilteredData';
import SectionHeader from '@/components/SectionHeader';
import EmptyState from '@/components/EmptyState';
import StatCard from '@/components/StatCard';
import { KONUM_COLORS, KONUM_LABELS, TOPIC_LABELS, REGION_LABELS } from '@/lib/constants';
import type { Tez } from '@/lib/types';
import rawData from '@/public/data/tezler.json';

const DATA = rawData as Tez[];

const TURLER = ['Yüksek Lisans', 'Doktora'] as const;
const TUR_COLORS: Record<string, string> = {
  'Yüksek Lisans': '#3B82F6', // blue-500
  'Doktora':       '#F59E0B', // amber-500
};
const KONUMLAR = ['merkez', 'yari_merkez', 'tasra'] as const;

const TOOLTIP_STYLE = { background: '#1E293B', border: '1px solid #334155', borderRadius: 8 };
const pct = (v: number) => `%${v.toLocaleString('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}`;
const codeNum = (c: string) => Number(c.slice(1));

/** Her grubun kendi tez sayısına göre, kodu taşıyan tezlerin yüzdesi. */
function sharesByGroup(
  data: Tez[],
  field: 'topic_codes' | 'region_codes',
  labels: Record<string, string>,
  prefix: 'K' | 'B',
  groupOf: (t: Tez) => string | null,
  groups: readonly string[],
) {
  const totals: Record<string, number> = {};
  const counts: Record<string, Record<string, number>> = {};
  data.forEach((t) => {
    const g = groupOf(t);
    if (!g || !groups.includes(g)) return;
    totals[g] = (totals[g] ?? 0) + 1;
    (t[field] ?? []).forEach((c) => {
      if (!c.startsWith(prefix) || !labels[c]) return;
      counts[c] ??= {};
      counts[c][g] = (counts[c][g] ?? 0) + 1;
    });
  });
  const allTotal = groups.reduce((s, g) => s + (totals[g] ?? 0), 0);
  return Object.keys(counts)
    .map((c) => {
      const row: Record<string, string | number> = { code: c, name: `${c} · ${labels[c]}` };
      let sum = 0;
      groups.forEach((g) => {
        const n = counts[c][g] ?? 0;
        sum += n;
        row[g] = totals[g] ? Math.round((n / totals[g]) * 1000) / 10 : 0;
      });
      row._overall = allTotal ? sum / allTotal : 0;
      return row;
    })
    .sort((a, b) => (b._overall as number) - (a._overall as number) || codeNum(a.code as string) - codeNum(b.code as string));
}

export default function TezlerSection() {
  const data = useFilteredData(DATA);

  const kpi = useMemo(() => {
    const yl = data.filter((t) => t.tez_turu === 'Yüksek Lisans').length;
    const dr = data.filter((t) => t.tez_turu === 'Doktora').length;
    const uni = new Set(data.map((t) => t.universite).filter(Boolean)).size;
    const bilinmeyen = data.filter((t) => t.konum === 'bilinmiyor').length;
    return { yl, dr, uni, bilinmeyen };
  }, [data]);

  // Yıllara göre tez sayısı (YL / Doktora yığılmış)
  const yearData = useMemo(() => {
    const counts: Record<number, Record<string, number>> = {};
    data.forEach((t) => {
      if (!TURLER.includes(t.tez_turu as typeof TURLER[number])) return;
      counts[t.year] ??= {};
      counts[t.year][t.tez_turu] = (counts[t.year][t.tez_turu] ?? 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([year, v]) => ({ year, ...v }));
  }, [data]);

  const topicByTur  = useMemo(() => sharesByGroup(data, 'topic_codes',  TOPIC_LABELS,  'K', (t) => t.tez_turu, TURLER), [data]);
  const regionByTur = useMemo(() => sharesByGroup(data, 'region_codes', REGION_LABELS, 'B', (t) => t.tez_turu, TURLER), [data]);
  const topicByKonum  = useMemo(() => sharesByGroup(data, 'topic_codes',  TOPIC_LABELS,  'K', (t) => t.konum, KONUMLAR), [data]);
  const regionByKonum = useMemo(() => sharesByGroup(data, 'region_codes', REGION_LABELS, 'B', (t) => t.konum, KONUMLAR), [data]);

  // En çok tez üretilen 15 üniversite
  const uniData = useMemo(() => {
    const counts: Record<string, Record<string, number>> = {};
    data.forEach((t) => {
      if (!t.universite || !TURLER.includes(t.tez_turu as typeof TURLER[number])) return;
      counts[t.universite] ??= {};
      counts[t.universite][t.tez_turu] = (counts[t.universite][t.tez_turu] ?? 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, v]) => ({ name, ...v, _t: (v['Yüksek Lisans'] ?? 0) + (v['Doktora'] ?? 0) }))
      .sort((a, b) => b._t - a._t)
      .slice(0, 15);
  }, [data]);

  if (data.length === 0) return <EmptyState label="tez" />;

  return (
    <div className="space-y-12">
      <SectionHeader
        title="Yüksek Lisans ve Doktora Tezleri"
        description="YÖK Ulusal Tez Merkezi'ndeki Uluslararası İlişkiler tezleri (2006–2025). Konu ve bölgeler, tez başlığı ve Türkçe özetinin metin analiziyle atanmıştır."
        count={data.length}
        countLabel="tez"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard value={data.length.toLocaleString('tr-TR')} label="Tez" sub="2006–2025" color="text-teal-400" />
        <StatCard value={kpi.yl.toLocaleString('tr-TR')} label="Yüksek Lisans" color="text-blue-400" />
        <StatCard value={kpi.dr.toLocaleString('tr-TR')} label="Doktora" color="text-amber-400" />
        <StatCard value={kpi.uni.toLocaleString('tr-TR')} label="Üniversite" sub="tez veren" color="text-violet-400" />
      </div>

      <ChartCard title="Yıllara Göre Tez Sayısı">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={yearData}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="year" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Legend itemSorter={null} />
            {TURLER.map((t) => (
              <Bar key={t} dataKey={t} stackId="a" fill={TUR_COLORS[t]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid lg:grid-cols-2 gap-8">
        <ChartCard
          title="Konu Dağılımı: Yüksek Lisans ve Doktora"
          note="Her türün kendi tez sayısına göre yüzde. Bir tez birden fazla konuya girebilir."
        >
          <GroupedBars rows={topicByTur} groups={TURLER} colors={TUR_COLORS} />
        </ChartCard>
        <ChartCard
          title="Bölge Dağılımı: Yüksek Lisans ve Doktora"
          note="Her türün kendi tez sayısına göre yüzde. Bir tez birden fazla bölgeye girebilir."
        >
          <GroupedBars rows={regionByTur} groups={TURLER} colors={TUR_COLORS} />
        </ChartCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <ChartCard
          title="Konu Dağılımı: Merkez / Yarı Merkez / Taşra"
          note="Her konum grubunun kendi tez sayısına göre yüzde."
        >
          <GroupedBars rows={topicByKonum} groups={KONUMLAR} colors={KONUM_COLORS} labels={KONUM_LABELS} />
        </ChartCard>
        <ChartCard
          title="Bölge Dağılımı: Merkez / Yarı Merkez / Taşra"
          note="Her konum grubunun kendi tez sayısına göre yüzde."
        >
          <GroupedBars rows={regionByKonum} groups={KONUMLAR} colors={KONUM_COLORS} labels={KONUM_LABELS} />
        </ChartCard>
      </div>

      <ChartCard title="En Çok Tez Üretilen 15 Üniversite">
        <ResponsiveContainer width="100%" height={Math.max(300, uniData.length * 30)}>
          <BarChart data={uniData} layout="vertical" margin={{ left: 5, right: 15 }}>
            <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
            <YAxis
              interval={0} type="category" dataKey="name" width={260}
              tick={CategoryTick}
            />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Legend itemSorter={null} />
            {TURLER.map((t) => (
              <Bar key={t} dataKey={t} stackId="a" fill={TUR_COLORS[t]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-5 text-xs text-slate-400 leading-relaxed space-y-2">
        <h3 className="text-sm font-semibold text-slate-300">Yöntem notları</h3>
        <p>
          Konu (K1–K17) ve bölge (B1–B16) kodları, proje kod kitabına dayanan anahtar kelime sözlükleriyle atanmıştır:
          başlıkta geçen kelime 10 puan, Türkçe özetteki her geçiş 1 puan; toplam puanı 3 ve üzeri olan konu/bölge teze atanır.
          Bir tez birden fazla konu ve bölgeye girebilir, bu yüzden yüzdelerin toplamı 100&apos;ü aşar.
        </p>
        <p>
          Doktora özetleri yüksek lisans özetlerinden ortalama daha uzundur (230&apos;a karşı 196 kelime); uzun özetler eşiği daha
          kolay geçtiği için doktoradaki genel yükseklik kısmen bundan kaynaklanabilir. Sıralamalar ve göreli farklar daha güvenilirdir.
        </p>
        <p>
          {kpi.bilinmeyen.toLocaleString('tr-TR')} tezin üniversitesi çalışma kapsamındaki üniversitelerle eşleşmediği için konum ve
          kurum türü bilinmemektedir; bu tezler konum/kurum filtrelerinden bağımsız olarak her zaman sayılır, konum grafiklerinde yer almaz.
        </p>
      </div>
    </div>
  );
}

type TickProps = { x?: number | string; y?: number | string; payload?: { value?: string | number } };
function CategoryTick({ x = 0, y = 0, payload }: TickProps) {
  return (
    <text x={Number(x) - 5} y={Number(y)} dy={3} textAnchor="end" fill="#94A3B8" fontSize={10}>
      {payload?.value}
    </text>
  );
}

function GroupedBars({
  rows, groups, colors, labels,
}: {
  rows: Record<string, string | number>[];
  groups: readonly string[];
  colors: Record<string, string>;
  labels?: Record<string, string>;
}) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(300, rows.length * (groups.length * 9 + 14))}>
      <BarChart data={rows} layout="vertical" margin={{ left: 5, right: 25 }} barGap={1}>
        <CartesianGrid horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `%${v}`} />
        <YAxis
          interval={0} type="category" dataKey="name" width={190}
          tick={CategoryTick}
        />
        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v, n) => [pct(Number(v)), labels?.[String(n)] ?? String(n)]} />
        <Legend itemSorter={null} formatter={(v: string) => labels?.[v] ?? v} />
        {groups.map((g) => (
          <Bar key={g} dataKey={g} fill={colors[g]} radius={[0, 3, 3, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

function ChartCard({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-slate-300">{title}</h3>
      {note && <p className="text-xs text-slate-500 mt-1">{note}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
}
