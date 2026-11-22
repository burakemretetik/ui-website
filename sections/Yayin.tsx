'use client';
import { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell,
  LineChart, Line, ReferenceLine, CartesianGrid,
} from 'recharts';
import SectionHeader from '@/components/SectionHeader';
import EmptyState from '@/components/EmptyState';
import { useFilterStore } from '@/hooks/useFilterStore';
import { KONUM_COLORS, KURUM_COLORS, TOPIC_LABELS, REGION_LABELS } from '@/lib/constants';
import {
  grupKayitlari, filtrele, etki, uyelik, sahip, yillik, enCokAtif, donem, sayi,
  DONEMLER, YKONUM_SIRA, YTUR_SIRA, GRUP_KISA,
  type GrupId, type GrupKayit, type YayinData, type YayinFiltre,
} from '@/lib/yayin';
import rawData from '@/public/data/yayinlar.json';

const DATA = rawData as unknown as YayinData;
const GRUPLAR = DATA.meta.gruplar;
const ROWS = Object.fromEntries(GRUPLAR.map((g) => [g.id, grupKayitlari(DATA, g.id)])) as Record<GrupId, GrupKayit[]>;

const GRUP_ACIKLAMA: Record<GrupId, string> = {
  ir_esci: 'Web of Science "International Relations" kategorisi; SSCI ve ESCI dergileri birlikte.',
  ir_ssci: 'Web of Science "International Relations" kategorisi; yalnız SSCI dergileri (ESCI hariç).',
  sb_esci: 'Web of Science "Political Science" kategorisi; SSCI ve ESCI dergileri birlikte.',
  sb_ssci: 'Web of Science "Political Science" kategorisi; yalnız SSCI dergileri (ESCI hariç).',
};

const KONUM_AD: Record<string, string> = { merkez: 'Merkez', yari_merkez: 'Yarı merkez', tasra: 'Taşra', yurt_disi: 'Yurt dışı' };
const KONUM_RENK: Record<string, string> = { ...KONUM_COLORS, yurt_disi: '#64748B' };
const TUR_AD: Record<string, string> = { devlet: 'Devlet', vakif: 'Vakıf', yurt_disi: 'Yurt dışı' };
const TUR_RENK: Record<string, string> = { ...KURUM_COLORS, yurt_disi: '#64748B' };
const KONU_KODLARI = Object.keys(TOPIC_LABELS).filter((k) => k.startsWith('K'));
const BOLGE_KODLARI = Object.keys(REGION_LABELS).filter((k) => k.startsWith('B'));

const TOOLTIP_STYLE = { background: '#1E293B', border: '1px solid #334155', borderRadius: 8 };
const yuzde = (v: number | null | undefined, d = 1) => (v == null ? '–' : `%${sayi(v, d)}`);

export default function YayinSection() {
  const [grup, setGrup] = useState<GrupId>('ir_esci');
  const { konum, kurum_turu, topic_codes, region_codes, years } = useFilterStore();

  const filtre: YayinFiltre = useMemo(
    () => ({ konum, kurum: kurum_turu, years, topics: topic_codes, regions: region_codes }),
    [konum, kurum_turu, years, topic_codes, region_codes],
  );
  const filtreli = useMemo(
    () => Object.fromEntries(GRUPLAR.map((g) => [g.id, filtrele(ROWS[g.id], filtre)])) as Record<GrupId, GrupKayit[]>,
    [filtre],
  );
  const rows = filtreli[grup];
  const genel = useMemo(() => etki(rows), [rows]);

  const yilData = useMemo(() => yillik(rows), [rows]);

  const konumData = useMemo(
    () => uyelik(rows, 'k', YKONUM_SIRA).satirlar.map((s) => ({ ...s, ad: KONUM_AD[s.kod], renk: KONUM_RENK[s.kod] })),
    [rows],
  );
  const turData = useMemo(
    () => uyelik(rows, 'u', YTUR_SIRA).satirlar.map((s) => ({ ...s, ad: TUR_AD[s.kod], renk: TUR_RENK[s.kod] })),
    [rows],
  );

  const konumDonem = useMemo(
    () => DONEMLER.map((p) => {
      const part = rows.filter((r) => donem(r.pub.y) === p);
      const u = uyelik(part, 'k', YKONUM_SIRA).satirlar;
      return { donem: p, ...Object.fromEntries(u.map((s) => [s.kod, s.pct])) };
    }),
    [rows],
  );

  const konuData = useMemo(
    () => uyelik(rows, 'tc', KONU_KODLARI).satirlar
      .filter((s) => s.n > 0).sort((a, b) => b.n - a.n)
      .map((s) => ({ ...s, ad: `${s.kod} ${TOPIC_LABELS[s.kod]}` })),
    [rows],
  );
  const bolgeData = useMemo(
    () => uyelik(rows, 'rc', BOLGE_KODLARI).satirlar
      .filter((s) => s.n > 0).sort((a, b) => b.n - a.n)
      .map((s) => ({ ...s, ad: `${s.kod} ${REGION_LABELS[s.kod]}` })),
    [rows],
  );

  const cnciKonum = useMemo(
    () => YKONUM_SIRA.map((k) => ({ kod: k, ad: KONUM_AD[k], renk: KONUM_RENK[k], ...etki(sahip(rows, 'k', k)) })).filter((d) => d.n > 0),
    [rows],
  );
  const cnciTur = useMemo(
    () => YTUR_SIRA.map((k) => ({ kod: k, ad: TUR_AD[k], renk: TUR_RENK[k], ...etki(sahip(rows, 'u', k)) })).filter((d) => d.n > 0),
    [rows],
  );
  const cnciDonem = useMemo(
    () => DONEMLER.map((p) => ({ donem: p, ...etki(rows.filter((r) => donem(r.pub.y) === p)) })),
    [rows],
  );

  const isbirligi = useMemo(() => {
    const n = rows.length;
    return DATA.isbirligi
      .map((ad, i) => {
        const part = rows.filter((r) => r.pub.c === i);
        return { ad, n: part.length, pct: n ? (100 * part.length) / n : 0, ...pick(etki(part)) };
      })
      .filter((d) => d.n > 0 && d.ad !== 'Belirtilmemiş')
      .sort((a, b) => b.n - a.n);
  }, [rows]);

  const enCok = useMemo(() => enCokAtif(rows, 10), [rows]);

  const karsilastirma = useMemo(
    () => GRUPLAR.map((g) => ({ id: g.id, yayin: filtreli[g.id].length, ...etki(filtreli[g.id]) })),
    [filtreli],
  );

  const grupAd = GRUPLAR.find((g) => g.id === grup)?.ad ?? '';

  return (
    <div className="space-y-12">
      <SectionHeader
        title="Yayın & Bibliyometri"
        description="Web of Science (InCites) kayıtları, 2000–2025: yayın üretimi, kurum konumu ve türü, konu ve bölge dağılımı, atıf etkisi (CNCI)."
        count={rows.length}
        countLabel="yayın"
      />

      {/* Veri grubu seçimi */}
      <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-5 flex flex-col md:flex-row md:items-center gap-4">
        <label htmlFor="yayin-grup" className="text-xs font-semibold text-slate-400 uppercase tracking-widest whitespace-nowrap">
          Veri grubu
        </label>
        <select
          id="yayin-grup"
          value={grup}
          onChange={(e) => setGrup(e.target.value as GrupId)}
          className="bg-slate-900 border border-slate-600 text-slate-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500 md:w-96"
        >
          {GRUPLAR.map((g) => (
            <option key={g.id} value={g.id}>{g.ad}</option>
          ))}
        </select>
        <p className="text-xs text-slate-400 leading-relaxed">
          {GRUP_ACIKLAMA[grup]}{' '}Atıf ve CNCI değerleri InCites&apos;ta bu filtreyle alındığından aynı yayının değeri gruplar arasında farklı olabilir.
        </p>
      </div>

      {rows.length === 0 ? (
        <EmptyState label="yayın" />
      ) : (
        <>
          {/* Özet */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <SummaryCard label="Yayın (tüm türler)" value={sayi(rows.length)} color="#0D9488" />
            <SummaryCard label="Makale + derleme" value={sayi(genel.n)} color="#14B8A6" />
            <SummaryCard label="Toplam atıf" sub="makale + derleme" value={sayi(genel.toplamAtif)} color="#7C3AED" />
            <SummaryCard label="CNCI ortalama" sub={`medyan ${sayi(genel.cnciMed, 2)} · dünya ort. = 1`} value={sayi(genel.cnciOrt, 2)} color="#D97706" />
            <SummaryCard label="En çok atıf alan %10'da" sub="beklenen %10" value={yuzde(genel.top10Pct)} color="#DC2626" />
          </div>

          <ChartCard title="Yıllara Göre Yayın Sayısı">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={yilData}>
                <XAxis dataKey="yil" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend itemSorter={null} wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="arastirma" name="Makale + derleme" stackId="a" fill="#0D9488" />
                <Bar dataKey="diger" name="Diğer türler (kitap eleştirisi, editoryal vb.)" stackId="a" fill="#475569" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <div className="grid lg:grid-cols-2 gap-8">
            <ChartCard title="Kurum Konumu" note="Kodlu yayınlar içinde %. Bir yayın birden çok konumda olabilir.">
              <PayGrafigi data={konumData} />
            </ChartCard>
            <ChartCard title="Kurum Türü" note="Kodlu yayınlar içinde %. Bir yayın birden çok türde olabilir.">
              <PayGrafigi data={turData} />
            </ChartCard>
          </div>

          <ChartCard title="Kurum Konumunun Dönemlere Göre Payı" note="Her dönemde konum kodu olan yayınlar içinde %.">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={konumDonem} margin={{ right: 20 }}>
                <CartesianGrid stroke="#334155" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="donem" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `%${v}`} />
                <Tooltip contentStyle={TOOLTIP_STYLE} itemSorter={() => 0} formatter={(v: unknown, name: unknown) => [yuzde(v as number), name as string]} />
                <Legend itemSorter={null} wrapperStyle={{ fontSize: 12 }} />
                {YKONUM_SIRA.map((k) => (
                  <Line key={k} dataKey={k} name={KONUM_AD[k]} stroke={KONUM_RENK[k]} strokeWidth={2} dot={{ r: 3 }} connectNulls />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Konu Dağılımı (K1–K17)" note="Konu kodu olan yayınlar içinde %. Bir yayın birden çok konuda olabilir.">
            <YatayPay data={konuData} renk={(i) => `hsl(${172 + i * 8}, 70%, ${45 - i * 1.2}%)`} />
          </ChartCard>

          <ChartCard title="Bölge Dağılımı (B1–B16)" note="Bölge kodu olan yayınlar içinde %. Bir yayın birden çok bölgede olabilir.">
            <YatayPay data={bolgeData} renk={(i) => `hsl(${38 + i * 5}, 80%, ${45 - i * 1.2}%)`} />
          </ChartCard>

          <div className="grid lg:grid-cols-2 gap-8">
            <ChartCard title="CNCI – Kurum Konumu" note="Yalnız makale ve derleme. Kesikli çizgi: dünya ortalaması (1).">
              <CnciGrafigi data={cnciKonum} />
            </ChartCard>
            <ChartCard title="CNCI – Kurum Türü" note="Yalnız makale ve derleme. Kesikli çizgi: dünya ortalaması (1).">
              <CnciGrafigi data={cnciTur} />
            </ChartCard>
          </div>

          <ChartCard title="CNCI – Dönemler" note="Yalnız makale ve derleme. Son yılların atıfları henüz oturmadı; dikkatle yorumlanmalı.">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={cnciDonem} margin={{ right: 20 }}>
                <CartesianGrid stroke="#334155" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="donem" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => sayi(v, 1)} domain={[0, (max: number) => Math.max(1.2, Math.ceil(max * 12) / 10)]} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: unknown, name: unknown) => [sayi(v as number, 2), name as string]} />
                <Legend itemSorter={null} wrapperStyle={{ fontSize: 12 }} />
                <ReferenceLine y={1} stroke="#94A3B8" strokeDasharray="4 4" label={{ value: 'dünya ort. = 1', position: 'insideTopLeft', fontSize: 10, fill: '#94A3B8' }} />
                <Line dataKey="cnciOrt" name="CNCI ortalama" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                <Line dataKey="cnciMed" name="CNCI medyan" stroke="#FCD34D" strokeOpacity={0.6} strokeWidth={2} dot={{ r: 3 }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="İşbirliği Türü" note="Yayın payı (%). Tooltip'te CNCI ortalaması (yalnız makale ve derleme).">
            <ResponsiveContainer width="100%" height={Math.max(200, isbirligi.length * 40)}>
              <BarChart data={isbirligi} layout="vertical" margin={{ left: 10, right: 40 }}>
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v: number) => `%${v}`} />
                <YAxis type="category" dataKey="ad" width={230} interval={0} tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(v: unknown, _n: unknown, item: { payload?: { n: number; cnciOrt: number | null } }) =>
                    [`${yuzde(v as number)} (${sayi(item.payload?.n)} yayın) · CNCI ${sayi(item.payload?.cnciOrt, 2)}`, 'Pay']}
                />
                <Bar dataKey="pct" fill="#0D9488" radius={[0, 4, 4, 0]} label={{ position: 'right', fontSize: 10, fill: '#CBD5E1', formatter: (v: unknown) => yuzde(v as number) }} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="En Çok Atıf Alan 10 Makale / Derleme">
            <div className="space-y-2 mt-2">
              {enCok.map((r, i) => (
                <div key={i} className="flex items-start gap-3 py-2 border-b border-slate-700/50 last:border-0">
                  <span className="text-xs font-mono text-teal-500 w-5 shrink-0 mt-0.5">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-200 leading-relaxed">{r.pub.t}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {DATA.dergiler[r.pub.j] ?? '–'} · {r.pub.y ?? '–'}
                      {r.pub.k && r.pub.k.length > 0 && <> · {r.pub.k.map((k) => KONUM_AD[k]).join(', ')}</>}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-amber-400">{sayi(r.tc)}</div>
                    <div className="text-[10px] text-slate-500">CNCI {sayi(r.cnci, 2)}</div>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </>
      )}

      <ChartCard title="Dört Grubun Karşılaştırması (seçili filtrelerle)" note="Atıf göstergeleri yalnız makale ve derleme. Seçili grup vurgulanmıştır.">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-700">
                <th className="text-left font-medium py-2 pr-4">Gösterge</th>
                {karsilastirma.map((g) => (
                  <th key={g.id} className={`text-right font-medium py-2 px-3 whitespace-nowrap ${g.id === grup ? 'text-teal-300' : ''}`}>{GRUP_KISA[g.id]}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-slate-300">
              {([
                ['Yayın (tüm türler)', (g) => sayi(g.yayin)],
                ['Makale + derleme', (g) => sayi(g.n)],
                ['Toplam atıf', (g) => sayi(g.toplamAtif)],
                ['Ortalama atıf', (g) => sayi(g.ortAtif, 2)],
                ['Medyan atıf', (g) => sayi(g.medAtif, 1)],
                ['Hiç atıf almamış', (g) => yuzde(g.atifsizPct)],
                ['CNCI ortalama', (g) => sayi(g.cnciOrt, 3)],
                ['CNCI medyan', (g) => sayi(g.cnciMed, 3)],
                ['En çok atıf alan %10 içinde', (g) => yuzde(g.top10Pct)],
              ] as [string, (g: (typeof karsilastirma)[number]) => string][]).map(([ad, f]) => (
                <tr key={ad} className="border-b border-slate-800 last:border-0">
                  <td className="py-1.5 pr-4 text-slate-400">{ad}</td>
                  {karsilastirma.map((g) => (
                    <td key={g.id} className={`py-1.5 px-3 text-right tabular-nums ${g.id === grup ? 'text-teal-300 font-semibold bg-teal-900/20' : ''}`}>{f(g)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>

      <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-5 text-xs text-slate-400 leading-relaxed space-y-1.5">
        <p className="text-slate-300 font-semibold">Yöntem notları · {grupAd}</p>
        <p>Kaynak: {DATA.meta.kaynak} Hazırlanma: 22.11.2026.</p>
        <p>Yayın sayıları, kurum, konu ve bölge dağılımları tüm belge türleriyle; atıf, CNCI ve &quot;en çok atıf alan %10&quot; yalnız Article + Review ile hesaplanır (InCites önerisi).</p>
        <p>CNCI (Category Normalized Citation Impact): yayının atıfının aynı kategori, yıl ve belge türündeki beklenen atıfa oranı; 1 = dünya ortalaması. Grup değeri yayınların CNCI ortalamasıdır; ortalama birkaç çok atıflı yayından etkilendiği için medyan da verilir. &quot;En çok atıf alan %10&quot;: Percentile in Subject Area ≥ 90.</p>
        <p>Kurum konumu, kurum türü, konu ve bölgede bir yayın her kategoride en fazla bir kez sayılır; yüzdelerin toplamı 100&apos;ü geçebilir. &quot;-----&quot; ve &quot;—&quot; yazan kodlar kodlanmamış sayıldı.</p>
        <p>Konum veya kurum türü filtresi daraltıldığında yalnız seçili kategoride kurumu olan yayınlar gösterilir; konum (tür) kodu olmayan yayınlar bu durumda hesaba girmez.</p>
      </div>
    </div>
  );
}

function pick(e: ReturnType<typeof etki>) {
  return { cnciOrt: e.cnciOrt };
}

function SummaryCard({ label, value, color, sub }: { label: string; value: string; color: string; sub?: string }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
      <div className="text-2xl font-bold tabular-nums" style={{ color }}>{value}</div>
      <div className="text-sm text-slate-400 mt-1">{label}</div>
      {sub && <div className="text-[11px] text-slate-500 mt-0.5">{sub}</div>}
    </div>
  );
}

function ChartCard({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-slate-300">{title}</h3>
      {note && <p className="text-[11px] text-slate-500 mt-1">{note}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
}

type PaySatiri = { kod: string; ad: string; renk: string; n: number; pct: number | null };

function PayGrafigi({ data }: { data: PaySatiri[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 20 }}>
        <XAxis dataKey="ad" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `%${v}`} />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          formatter={(v: unknown, _n: unknown, item: { payload?: PaySatiri }) => [`${yuzde(v as number)} (${sayi(item.payload?.n)} yayın)`, 'Pay']}
        />
        <Bar dataKey="pct" radius={[4, 4, 0, 0]} label={{ position: 'top', fontSize: 10, fill: '#CBD5E1', formatter: (v: unknown) => yuzde(v as number) }}>
          {data.map((d) => <Cell key={d.kod} fill={d.renk} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function YatayPay({ data, renk }: { data: { kod: string; ad: string; n: number; pct: number | null }[]; renk: (i: number) => string }) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(260, data.length * 28)}>
      <BarChart data={data} layout="vertical" margin={{ left: 10, right: 60 }}>
        <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v: number) => `%${v}`} />
        <YAxis type="category" dataKey="ad" width={210} interval={0} tick={{ fontSize: 11, fill: '#94A3B8' }} />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          formatter={(v: unknown, _n: unknown, item: { payload?: { n: number } }) => [`${yuzde(v as number)} (${sayi(item.payload?.n)} yayın)`, 'Pay']}
        />
        <Bar dataKey="pct" radius={[0, 4, 4, 0]} label={{ position: 'right', fontSize: 10, fill: '#CBD5E1', formatter: (v: unknown) => yuzde(v as number) }}>
          {data.map((d, i) => <Cell key={d.kod} fill={renk(i)} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function CnciGrafigi({ data }: { data: ({ kod: string; ad: string; renk: string } & ReturnType<typeof etki>)[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 20 }}>
        <XAxis dataKey="ad" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => sayi(v, 1)} />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          formatter={(v: unknown, name: unknown, item: { payload?: { n: number } }) => [`${sayi(v as number, 2)} (${sayi(item.payload?.n)} makale/derleme)`, name as string]}
        />
        <Legend itemSorter={null} wrapperStyle={{ fontSize: 12 }} />
        <ReferenceLine y={1} stroke="#94A3B8" strokeDasharray="4 4" />
        <Bar dataKey="cnciOrt" name="Ortalama" fill="#94A3B8" radius={[4, 4, 0, 0]} label={{ position: 'top', fontSize: 10, fill: '#CBD5E1', formatter: (v: unknown) => sayi(v as number, 2) }}>
          {data.map((d) => <Cell key={d.kod} fill={d.renk} />)}
        </Bar>
        <Bar dataKey="cnciMed" name="Medyan" fill="#475569" radius={[4, 4, 0, 0]} label={{ position: 'top', fontSize: 10, fill: '#94A3B8', formatter: (v: unknown) => sayi(v as number, 2) }}>
          {data.map((d) => <Cell key={d.kod} fill={d.renk} fillOpacity={0.45} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
