'use client';
import { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useFilteredData } from '@/hooks/useFilteredData';
import SectionHeader from '@/components/SectionHeader';
import EmptyState from '@/components/EmptyState';
import type { MisyonVizyon } from '@/lib/types';
import rawData from '@/public/data/misyon_vizyon.json';
const DATA = rawData as MisyonVizyon[];

// Türkçe stop words
const STOP_WORDS = new Set([
  've', 'ile', 've', 'bir', 'bu', 'da', 'de', 'en', 'için', 'olan', 'olarak',
  'olan', 'hem', 'her', 'ya', 'veya', 'gibi', 'kadar', 'çok', 'daha', 'olan',
  'ise', 'ki', 'bu', 'o', 'ben', 'biz', 'siz', 'onlar', 'aynı', 'ilgili',
  'başta', 'olan', 'olup', 'olan', 'olan', 'olmuş', 'eder', 'etmek', 'olan',
  'olan', 'doğru', 'karşı', 'üzere', 'yönelik', 'açısından', 'üzerinde',
  'sahip', 'olmak', 'olması', 'olmaya', 'olmuş', 'üniversite', 'üniversitesi',
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-zçğıöşüa-z\s]/gi, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOP_WORDS.has(w));
}

function topWords(texts: (string | null)[], n = 30): { word: string; count: number }[] {
  const counts: Record<string, number> = {};
  texts.forEach((t) => {
    if (!t) return;
    tokenize(t).forEach((w) => { counts[w] = (counts[w] ?? 0) + 1; });
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([word, count]) => ({ word, count }));
}

export default function MisyonVizyonSection() {
  const data = useFilteredData(DATA);
  const [tab, setTab] = useState<'misyon' | 'vizyon'>('misyon');

  const devlet = useMemo(() => data.filter((d) => d.kurum_turu === 'devlet'), [data]);
  const vakif  = useMemo(() => data.filter((d) => d.kurum_turu === 'vakif'), [data]);

  const devletWords = useMemo(() => topWords(devlet.map((d) => d[tab])), [devlet, tab]);
  const vakifWords  = useMemo(() => topWords(vakif.map((d)  => d[tab])), [vakif, tab]);

  // Karşılaştırmalı: her kelime için devlet ve vakıf sayısı
  const compareData = useMemo(() => {
    const devletMap = Object.fromEntries(devletWords.map((w) => [w.word, w.count]));
    const vakifMap  = Object.fromEntries(vakifWords.map((w) => [w.word, w.count]));
    const allWords  = [...new Set([...devletWords.map((w) => w.word), ...vakifWords.map((w) => w.word)])];
    return allWords
      .map((w) => ({ word: w, devlet: devletMap[w] ?? 0, vakif: vakifMap[w] ?? 0 }))
      .sort((a, b) => (b.devlet + b.vakif) - (a.devlet + a.vakif))
      .slice(0, 20);
  }, [devletWords, vakifWords]);


  if (data.length === 0) return <EmptyState label="üniversite" />;

  return (
    <div className="space-y-12">
      <SectionHeader
        title="Vizyon & Misyon Analizi"
        description="Türkiye'deki Uİ/SBUİ bölümü bulunan üniversitelerin vizyon ve misyon metinlerinin kelime frekans analizi."
        count={data.length}
        countLabel="üniversite"
      />

      {/* Tab seçici */}
      <div className="flex gap-2">
        {(['misyon', 'vizyon'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all border capitalize ${
              tab === t
                ? 'bg-teal-600 border-teal-600 text-white'
                : 'border-slate-600 text-slate-400 hover:border-slate-400'
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Devlet */}
        <ChartCard title={`Devlet Üniversiteleri — En Sık Kelimeler (${tab.charAt(0).toUpperCase() + tab.slice(1)})`}>
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={devletWords.slice(0, 15)} layout="vertical" margin={{ left: 290, right: 30 }}>
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis interval={0} type="category" dataKey="word" width={290} tick={(props: any) => (<text x={props.x - 5} y={props.y} dy={3} textAnchor="end" fill="#94A3B8" fontSize={10}>{props.payload.value}</text>)} />
              <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 8 }} />
              <Bar dataKey="count" fill="#1D4ED8" radius={[0, 4, 4, 0]}>
                {devletWords.slice(0, 15).map((_, i) => (
                  <Cell key={i} fill={`hsl(220, ${75 - i * 3}%, ${55 - i * 1.5}%)`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Vakıf */}
        <ChartCard title={`Vakıf Üniversiteleri — En Sık Kelimeler (${tab.charAt(0).toUpperCase() + tab.slice(1)})`}>
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={vakifWords.slice(0, 15)} layout="vertical" margin={{ left: 290, right: 30 }}>
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis interval={0} type="category" dataKey="word" width={290} tick={(props: any) => (<text x={props.x - 5} y={props.y} dy={3} textAnchor="end" fill="#94A3B8" fontSize={10}>{props.payload.value}</text>)} />
              <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 8 }} />
              <Bar dataKey="count" fill="#7C3AED" radius={[0, 4, 4, 0]}>
                {vakifWords.slice(0, 15).map((_, i) => (
                  <Cell key={i} fill={`hsl(262, ${75 - i * 3}%, ${55 - i * 1.5}%)`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Karşılaştırmalı */}
      <ChartCard title="Devlet vs Vakıf — Kelime Frekansı Karşılaştırması">
        <ResponsiveContainer width="100%" height={440}>
          <BarChart data={compareData} layout="vertical" margin={{ left: 290, right: 30 }}>
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis interval={0} type="category" dataKey="word" width={290} tick={(props: any) => (<text x={props.x - 5} y={props.y} dy={3} textAnchor="end" fill="#94A3B8" fontSize={10}>{props.payload.value}</text>)} />
            <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 8 }} />
            <Bar dataKey="devlet" name="Devlet" fill="#1D4ED8" />
            <Bar dataKey="vakif"  name="Vakıf"  fill="#7C3AED" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Metin örnekleri */}
      <ChartCard title="Örnek Metinler">
        <div className="grid md:grid-cols-2 gap-6 mt-2">
          <div>
            <p className="text-xs font-semibold text-blue-400 mb-3 uppercase tracking-wider">Devlet Üniversiteleri</p>
            <div className="space-y-3">
              {devlet.slice(0, 3).map((u, i) => (
                <div key={i} className="border-l-2 border-blue-700 pl-3">
                  <p className="text-xs font-medium text-slate-300">{u.universite}</p>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-3">{u[tab] ?? '—'}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-violet-400 mb-3 uppercase tracking-wider">Vakıf Üniversiteleri</p>
            <div className="space-y-3">
              {vakif.slice(0, 3).map((u, i) => (
                <div key={i} className="border-l-2 border-violet-700 pl-3">
                  <p className="text-xs font-medium text-slate-300">{u.universite}</p>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-3">{u[tab] ?? '—'}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
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
