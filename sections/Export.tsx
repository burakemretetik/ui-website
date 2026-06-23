'use client';
import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, Cell, PieChart, Pie,
  LineChart, Line, CartesianGrid, LabelList,
} from 'recharts';

// ── Data imports ─────────────────────────────────────────────────────────
import rawAkademisyen from '@/public/data/akademisyenler.json';
import rawMufredat    from '@/public/data/mufredat.json';
import rawProjeler   from '@/public/data/projeler.json';
import rawKontenjan  from '@/public/data/kontenjanlar.json';

import type { Akademisyen, DersKaydi, Proje, Kontenjan } from '@/lib/types';
import { UNVAN_ORDER, PROJE_COLORS } from '@/lib/constants';

const AKADEMISYEN = rawAkademisyen as Akademisyen[];
const MUFREDAT    = rawMufredat    as DersKaydi[];
const PROJELER    = rawProjeler    as Proje[];
const KONTENJAN   = rawKontenjan   as Kontenjan[];

// ── English label maps ────────────────────────────────────────────────────
const LOCATION_EN: Record<string, string> = {
  merkez:      'Centre',
  yari_merkez: 'Semi-Centre',
  tasra:       'Provincial',
  bilinmiyor:  'Unknown',
};

// Topic labels — keyed by both K-prefix (academics) and T-prefix (projects)
const TOPIC_LABEL: Record<string, string> = {
  K1:  'IR Theory',               T1:  'IR Theory',
  K2:  'Foreign Policy',           T2:  'Foreign Policy',
  K3:  'Security Studies',         T3:  'Security Studies',
  K4:  'International Political Economy', T4: 'International Political Economy',
  K5:  'Comparative Politics',     T5:  'Comparative Politics',
  K6:  'Gender & Identity',        T6:  'Gender & Identity',
  K7:  'Human Rights',             T7:  'Human Rights',
  K8:  'Environment & Energy',     T8:  'Environment & Energy',
  K9:  'Migration & Refugees',     T9:  'Migration & Refugees',
  K10: 'International Organizations', T10: 'International Organizations',
  K11: 'Diplomacy & Negotiation',  T11: 'Diplomacy & Negotiation',
  K12: 'History & Political History', T12: 'History & Political History',
  K13: 'Area Studies',             T13: 'Area Studies',
  K14: 'Public Admin. & Local Gov.', T14: 'Public Admin. & Local Gov.',
  K15: 'Culture & Communication',  T15: 'Culture & Communication',
  K16: 'Law & Governance',         T16: 'Law & Governance',
  K17: 'European Union',           T17: 'European Union',
};

// Region labels — keyed by both B-prefix (academics) and R-prefix (projects)
const REGION_LABEL: Record<string, string> = {
  B1:  'North America',   R1:  'North America',
  B2:  'Latin America',   R2:  'Latin America',
  B3:  'Western Europe',  R3:  'Western Europe',
  B4:  'Northern Europe', R4:  'Northern Europe',
  B5:  'Southern Europe', R5:  'Southern Europe',
  B6:  'Africa',          R6:  'Africa',
  B7:  'Central Asia',    R7:  'Central Asia',
  B8:  'Middle East',     R8:  'Middle East',
  B9:  'South Asia',      R9:  'South Asia',
  B10: 'Sub-Saharan Africa', R10: 'Sub-Saharan Africa',
  B11: 'East Asia',       R11: 'East Asia',
  B12: 'Southeast Asia',  R12: 'Southeast Asia',
  B13: 'Oceania',         R13: 'Oceania',
  B14: 'Balkans & Eastern Europe', R14: 'Balkans & Eastern Europe',
  B15: 'Caucasus',        R15: 'Caucasus',
  B16: 'Turkey',          R16: 'Turkey',
};

const UNVAN_EN: Record<string, string> = {
  'Profesör':             'Professor',
  'Doçent':              'Associate Professor',
  'Dr. Öğr. Üyesi':      'Assistant Professor',
  'Araştırma Görevlisi': 'Research Assistant',
  'Öğretim Görevlisi':  'Lecturer',
};

const GENDER_COLORS: Record<string, string> = {
  Male:    '#3B82F6',
  Female:  '#EC4899',
  Unknown: '#6B7280',
};

const LOCATION_COLORS_EN: Record<string, string> = {
  Centre:       '#0D9488',
  'Semi-Centre': '#D97706',
  Provincial:   '#DC2626',
  Unknown:      '#6B7280',
};

const SEVIYE_EN: Record<string, string> = {
  'Lisans':        'Undergraduate',
  'Yüksek Lisans': 'Graduate (MA)',
  'Doktora':       'Doctoral (PhD)',
};

const SEVIYE_COLORS_EN: Record<string, string> = {
  Undergraduate:    '#0D9488',
  'Graduate (MA)':  '#D97706',
  'Doctoral (PhD)': '#7C3AED',
};

const PROJE_COLORS_EN = PROJE_COLORS;

// ── Shared chart styling ──────────────────────────────────────────────────
const TOOLTIP_STYLE = { background: '#1E293B', border: '1px solid #334155', borderRadius: 8, fontSize: 12 };
const AXIS_TICK  = { fontSize: 11, fill: '#94A3B8' };
const LABEL_STYLE = { fontSize: 10, fill: '#94A3B8' };

// ── Course name normalization ─────────────────────────────────────────────
// Groups spelling variants caused by I/İ encoding differences and digit vs.
// Roman numeral suffixes (e.g. "TÜRK DİLİ I" ≡ "TÜRK DILI 1").
function normalizeCourse(name: string): string {
  // Normalize Turkish dotted İ → I before uppercasing so JS locale doesn't matter
  let s = name.trim().replace(/İ/g, 'I').replace(/ı/g, 'i');
  s = s.toUpperCase();
  // Ensure space before a trailing digit run (e.g. "TARIHI1" → "TARIHI 1")
  s = s.replace(/([A-ZÇĞÖŞÜ])(\d+)\s*$/, '$1 $2');
  // Normalize trailing Roman numeral II → 2, I → 1 so digit/Roman variants merge
  s = s.replace(/\s+II\s*$/, ' 2');
  s = s.replace(/\s+I\s*$/,  ' 1');
  return s.trim();
}

// ── Code label helpers — always display T/R prefix regardless of source prefix ──
// K1→T1, K12→T12 ; B1→R1, B14→R14 ; T1 stays T1 ; R1 stays R1
function topicLabel(code: string): string {
  const n = code.replace(/^[KT]/, '');
  return `T${n} (${TOPIC_LABEL[code] ?? code})`;
}
function regionLabel(code: string): string {
  const n = code.replace(/^[BR]/, '');
  return `R${n} (${REGION_LABEL[code] ?? code})`;
}

// ── Section IDs for print ─────────────────────────────────────────────────
export default function ExportSection() {

  // ════════════════════════════════════════════════════════════════════════
  // AKADEMISYEN DATA
  // ════════════════════════════════════════════════════════════════════════

  // 1. Gender distribution
  const genderData = useMemo(() => {
    const counts: Record<string, number> = { Male: 0, Female: 0 };
    AKADEMISYEN.forEach((a) => {
      if (a.cinsiyet === 'Erkek') counts['Male']++;
      else if (a.cinsiyet === 'Kadın') counts['Female']++;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, []);

  // 2. Title × Location — excluding "Other/Diğer"
  const titleData = useMemo(() => {
    const grouped: Record<string, Record<string, number>> = {};
    UNVAN_ORDER.filter((u) => u !== 'Diğer').forEach((u) => {
      grouped[u] = { Centre: 0, 'Semi-Centre': 0, Provincial: 0 };
    });
    AKADEMISYEN.forEach((a) => {
      if (a.unvan === 'Diğer') return;
      if (grouped[a.unvan]) {
        const loc = LOCATION_EN[a.konum];
        if (loc && loc !== 'Unknown') grouped[a.unvan][loc] = (grouped[a.unvan][loc] ?? 0) + 1;
      }
    });
    return UNVAN_ORDER
      .filter((u) => u !== 'Diğer')
      .map((u) => ({ name: UNVAN_EN[u] ?? u, ...grouped[u] }))
      .filter((r) => Object.values(r).slice(1).some((v) => (v as unknown as number) > 0));
  }, []);

  // 3. Research topics — all codes, filter na/unknown, label as "T1 (IR Theory)"
  const acTopicData = useMemo(() => {
    const counts: Record<string, number> = {};
    AKADEMISYEN.forEach((a) =>
      a.topic_codes?.forEach((k) => {
        if (k && k !== 'na' && TOPIC_LABEL[k]) counts[k] = (counts[k] ?? 0) + 1;
      })
    );
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([code, value]) => ({ code, name: topicLabel(code), value }));
  }, []);

  // 4. Research regions — all codes, filter na/unknown, label as "R1 (North America)"
  const acRegionData = useMemo(() => {
    const counts: Record<string, number> = {};
    AKADEMISYEN.forEach((a) =>
      a.region_codes?.forEach((b) => {
        if (b && b !== 'na' && REGION_LABEL[b]) counts[b] = (counts[b] ?? 0) + 1;
      })
    );
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([code, value]) => ({ code, name: regionLabel(code), value }));
  }, []);

  // ════════════════════════════════════════════════════════════════════════
  // MUFREDAT DATA
  // ════════════════════════════════════════════════════════════════════════

  // 5. Course level distribution
  const levelData = useMemo(() => {
    const s: Record<string, number> = { Undergraduate: 0, 'Graduate (MA)': 0, 'Doctoral (PhD)': 0 };
    MUFREDAT.forEach((d) => {
      const en = SEVIYE_EN[d.seviye];
      if (en) s[en] = (s[en] ?? 0) + 1;
    });
    return Object.entries(s).map(([name, value]) => ({ name, value }));
  }, []);

  // 6. Top 20 courses — normalized to merge I/İ and digit/Roman variants
  const topCourses = useMemo(() => {
    const counts: Record<string, number> = {};
    MUFREDAT.forEach((d) => {
      const key = normalizeCourse(d.ders_adi);
      counts[key] = (counts[key] ?? 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([name, value]) => ({
        name: name.length > 52 ? name.slice(0, 52) + '…' : name,
        value,
      }));
  }, []);

  // ════════════════════════════════════════════════════════════════════════
  // PROJELER DATA
  // ════════════════════════════════════════════════════════════════════════

  // 7. Project type distribution (pie)
  const projTypeData = useMemo(() => {
    const counts: Record<string, number> = {};
    PROJELER.forEach((p) => { counts[p.proje_turu] = (counts[p.proje_turu] ?? 0) + 1; });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value, color: PROJE_COLORS_EN[name] ?? '#6B7280' }));
  }, []);

  // 8. Project type × location
  const projByLocation = useMemo(() => {
    const locs = ['merkez', 'yari_merkez', 'tasra'] as const;
    return locs.map((k) => {
      const kData = PROJELER.filter((p) => p.konum === k);
      const row: Record<string, unknown> = { name: LOCATION_EN[k] };
      ['COST', 'TÜBİTAK 1001', 'Erasmus+', 'Jean Monnet'].forEach((t) => {
        row[t] = kData.filter((p) => p.proje_turu === t).length;
      });
      return row;
    });
  }, []);

  // 9. Topics in projects — all codes (T-prefix in data), label as "T1 (IR Theory)"
  const projTopicData = useMemo(() => {
    const counts: Record<string, number> = {};
    PROJELER.forEach((p) =>
      p.topic_codes?.forEach((k) => {
        if (k && k !== 'na' && TOPIC_LABEL[k]) counts[k] = (counts[k] ?? 0) + 1;
      })
    );
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([code, value]) => ({ code, name: topicLabel(code), value }));
  }, []);

  // 10. Regions in projects — all codes (R-prefix in data), label as "R1 (North America)"
  const projRegionData = useMemo(() => {
    const counts: Record<string, number> = {};
    PROJELER.forEach((p) =>
      p.region_codes?.forEach((b) => {
        if (b && b !== 'na' && REGION_LABEL[b]) counts[b] = (counts[b] ?? 0) + 1;
      })
    );
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([code, value]) => ({ code, name: regionLabel(code), value }));
  }, []);

  // 11. Projects by year — fill every year between min and max for a complete timeline
  const projByYear = useMemo(() => {
    const counts: Record<number, Record<string, number>> = {};
    PROJELER.filter((p) => p.year).forEach((p) => {
      const y = p.year!;
      if (!counts[y]) counts[y] = {};
      counts[y][p.proje_turu] = (counts[y][p.proje_turu] ?? 0) + 1;
    });
    const allYears = Object.keys(counts).map(Number);
    if (allYears.length > 0) {
      const minY = Math.min(...allYears);
      const maxY = Math.max(...allYears);
      for (let y = minY; y <= maxY; y++) {
        if (!counts[y]) counts[y] = {};
      }
    }
    return Object.entries(counts)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([year, v]) => ({ year, ...v }));
  }, []);

  // ════════════════════════════════════════════════════════════════════════
  // KONTENJAN DATA
  // ════════════════════════════════════════════════════════════════════════
  const YEARS = [2021, 2022, 2023, 2024, 2025];

  // 12. Annual quota by location (stacked bar)
  const quotaByLocation = useMemo(() => {
    return YEARS.map((year) => {
      const yearData = KONTENJAN.filter((d) => d.year === year);
      const row: Record<string, unknown> = { year };
      (['merkez', 'yari_merkez', 'tasra'] as const).forEach((k) => {
        row[LOCATION_EN[k]] = yearData.filter((d) => d.konum === k).reduce((s, d) => s + d.kontenjan, 0);
      });
      row['Total'] = yearData.reduce((s, d) => s + d.kontenjan, 0);
      return row;
    });
  }, []);

  // 13. State vs Foundation yearly
  const quotaByType = useMemo(() => {
    return YEARS.map((year) => {
      const yearData = KONTENJAN.filter((d) => d.year === year);
      return {
        year,
        'State':      yearData.filter((d) => d.kurum_turu === 'devlet').reduce((s, d) => s + d.kontenjan, 0),
        'Foundation': yearData.filter((d) => d.kurum_turu === 'vakif').reduce((s, d) => s + d.kontenjan, 0),
      };
    });
  }, []);

  // 14. Total quota trend
  const quotaTrend = useMemo(() =>
    quotaByLocation.map((r) => ({ year: r.year, 'Total Quota': r['Total'] })),
    [quotaByLocation]
  );

  // 15. Top departments 2025
  const top2025 = useMemo(() =>
    KONTENJAN
      .filter((d) => d.year === 2025)
      .sort((a, b) => b.kontenjan - a.kontenjan)
      .slice(0, 15),
    []
  );

  // Summary table data
  const summaryTable = useMemo(() => {
    return YEARS.map((year) => {
      const yd = KONTENJAN.filter((d) => d.year === year);
      return {
        year,
        centre:     yd.filter((d) => d.konum === 'merkez').reduce((s, d) => s + d.kontenjan, 0),
        semiCentre: yd.filter((d) => d.konum === 'yari_merkez').reduce((s, d) => s + d.kontenjan, 0),
        provincial: yd.filter((d) => d.konum === 'tasra').reduce((s, d) => s + d.kontenjan, 0),
        state:      yd.filter((d) => d.kurum_turu === 'devlet').reduce((s, d) => s + d.kontenjan, 0),
        foundation: yd.filter((d) => d.kurum_turu === 'vakif').reduce((s, d) => s + d.kontenjan, 0),
        total:      yd.reduce((s, d) => s + d.kontenjan, 0),
      };
    });
  }, []);

  // ════════════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-20 pb-20">

      {/* Page header */}
      <div className="pt-6">
        <p className="text-xs font-mono text-teal-500 uppercase tracking-widest mb-2">
          TÜBİTAK · Project No: 124K418 · TED University
        </p>
        <h1 className="text-3xl font-bold text-white mb-2">Publication Figures</h1>
        <p className="text-slate-400 text-sm max-w-2xl">
          All charts display unfiltered data from the full dataset. Figures are intended for academic publication use.
          Use your browser&apos;s print function (Ctrl+P) or a screenshot tool to capture individual charts.
        </p>
      </div>

      {/* ── SECTION 1: ACADEMICS ─────────────────────────────────────────── */}
      <Section id="academics" label="Section 1 · Academics">

        <FigureCard id="fig-gender" label="Figure 1" title="Gender Distribution of Academics">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={genderData}
                cx="50%" cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, value, percent }) =>
                  `${name}: ${value} (${((percent ?? 0) * 100).toFixed(1)}%)`
                }
              >
                {genderData.map((entry) => (
                  <Cell key={entry.name} fill={GENDER_COLORS[entry.name] ?? '#6B7280'} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v: unknown) => [v as number, 'Academics']}
                contentStyle={TOOLTIP_STYLE}
              />
            </PieChart>
          </ResponsiveContainer>
        </FigureCard>

        <FigureCard id="fig-title" label="Figure 2" title="Academic Title Distribution by Institutional Location">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={titleData} layout="vertical" margin={{ left: 290, right: 30 }}>
              <XAxis type="number" tick={AXIS_TICK} />
              <YAxis 
              interval={0} 
              type="category" 
              dataKey="name" 
              width={290} 
              tick={(props: any) => (<text x={props.x - 5} y={props.y} dy={3} textAnchor="end" fill="#94A3B8" fontSize={10}>{props.payload.value}</text>)} 
            />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend />
              {(['Centre', 'Semi-Centre', 'Provincial'] as const).map((k) => (
                <Bar key={k} dataKey={k} name={k} stackId="a" fill={LOCATION_COLORS_EN[k]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </FigureCard>

        <FigureCard id="fig-topics" label="Figure 3" title="Research Topics Among Academics">
          <ResponsiveContainer width="100%" height={Math.max(320, acTopicData.length * 28)}>
            <BarChart data={acTopicData} layout="vertical" margin={{ left: 290, right: 30 }}>
              <XAxis type="number" tick={AXIS_TICK} label={{ value: 'No. of Academics', position: 'insideBottom', offset: -2, fontSize: 11, fill: '#94A3B8' }} />
              <YAxis 
              interval={0} 
              type="category" 
              dataKey="name" 
              width={290} 
              tick={(props: any) => (<text x={props.x - 5} y={props.y} dy={3} textAnchor="end" fill="#94A3B8" fontSize={10}>{props.payload.value}</text>)} 
            />
              <Tooltip
                formatter={(v: unknown) => [v as number, 'Academics']}
                contentStyle={TOOLTIP_STYLE}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {acTopicData.map((_, i) => (
                  <Cell key={i} fill={`hsl(${172 + i * 8}, 70%, ${45 - i * 1.5}%)`} />
                ))}
                <LabelList dataKey="value" position="right" style={LABEL_STYLE} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </FigureCard>

        <FigureCard id="fig-regions" label="Figure 4" title="Research Regions Among Academics">
          <ResponsiveContainer width="100%" height={Math.max(300, acRegionData.length * 28)}>
            <BarChart data={acRegionData} layout="vertical" margin={{ left: 290, right: 30 }}>
              <XAxis type="number" tick={AXIS_TICK} label={{ value: 'No. of Academics', position: 'insideBottom', offset: -2, fontSize: 11, fill: '#94A3B8' }} />
              <YAxis 
              interval={0} 
              type="category" 
              dataKey="name" 
              width={290} 
              tick={(props: any) => (<text x={props.x - 5} y={props.y} dy={3} textAnchor="end" fill="#94A3B8" fontSize={10}>{props.payload.value}</text>)} 
            />
              <Tooltip
                formatter={(v: unknown) => [v as number, 'Academics']}
                contentStyle={TOOLTIP_STYLE}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {acRegionData.map((_, i) => (
                  <Cell key={i} fill={`hsl(${38 + i * 5}, 80%, ${45 - i * 1.5}%)`} />
                ))}
                <LabelList dataKey="value" position="right" style={LABEL_STYLE} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </FigureCard>

      </Section>

      {/* ── SECTION 2: CURRICULUM ────────────────────────────────────────── */}
      <Section id="curriculum" label="Section 2 · Curriculum">

        <FigureCard id="fig-level" label="Figure 5" title="Course Level Distribution">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={levelData} margin={{ left: 10, right: 30 }}>
              <XAxis dataKey="name" tick={AXIS_TICK} />
              <YAxis tick={AXIS_TICK} label={{ value: 'No. of Courses', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#94A3B8' }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: unknown) => [v as number, 'Courses']} />
              <Bar dataKey="value" name="Courses" radius={[4, 4, 0, 0]}>
                {levelData.map((entry) => (
                  <Cell key={entry.name} fill={SEVIYE_COLORS_EN[entry.name] ?? '#6B7280'} />
                ))}
                <LabelList dataKey="value" position="top" style={LABEL_STYLE} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </FigureCard>

        <FigureCard id="fig-courses" label="Figure 6" title="Top 20 Most Widely Offered Courses (by Number of Universities)">
          <ResponsiveContainer width="100%" height={580}>
            <BarChart data={topCourses} layout="vertical" margin={{ left: 290, right: 30 }}>
              <XAxis type="number" tick={AXIS_TICK} label={{ value: 'No. of Universities', position: 'insideBottom', offset: -2, fontSize: 11, fill: '#94A3B8' }} />
              <YAxis 
              interval={0} 
              type="category" 
              dataKey="name" 
              width={290} 
              tick={(props: any) => (<text x={props.x - 5} y={props.y} dy={3} textAnchor="end" fill="#94A3B8" fontSize={10}>{props.payload.value}</text>)} 
            />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: unknown) => [v as number, 'Universities']} />
              <Bar dataKey="value" name="Universities" radius={[0, 4, 4, 0]}>
                {topCourses.map((_, i) => (
                  <Cell key={i} fill={`hsl(172, ${75 - i * 2}%, ${45 - i}%)`} />
                ))}
                <LabelList dataKey="value" position="right" style={LABEL_STYLE} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </FigureCard>

      </Section>

      {/* ── SECTION 3: PROJECTS ──────────────────────────────────────────── */}
      <Section id="projects" label="Section 3 · Projects">

        <FigureCard id="fig-proj-type" label="Figure 7" title="Project Type Distribution">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={projTypeData}
                cx="50%" cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, value, percent }) =>
                  `${name}: ${value} (${((percent ?? 0) * 100).toFixed(1)}%)`
                }
                labelLine={false}
              >
                {projTypeData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} />
            </PieChart>
          </ResponsiveContainer>
        </FigureCard>

        <FigureCard id="fig-proj-location" label="Figure 8" title="Project Type by Institutional Location">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={projByLocation}>
              <XAxis dataKey="name" tick={AXIS_TICK} />
              <YAxis tick={AXIS_TICK} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend />
              {['COST', 'TÜBİTAK 1001', 'Erasmus+', 'Jean Monnet'].map((t) => (
                <Bar key={t} dataKey={t} stackId="a" fill={PROJE_COLORS_EN[t] ?? '#6B7280'} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </FigureCard>

        <FigureCard id="fig-proj-topics" label="Figure 9" title="Research Topics in Projects">
          <ResponsiveContainer width="100%" height={Math.max(280, projTopicData.length * 28)}>
            <BarChart data={projTopicData} layout="vertical" margin={{ left: 290, right: 30 }}>
              <XAxis type="number" tick={AXIS_TICK} />
              <YAxis 
              interval={0} 
              type="category" 
              dataKey="name" 
              width={290} 
              tick={(props: any) => (<text x={props.x - 5} y={props.y} dy={3} textAnchor="end" fill="#94A3B8" fontSize={10}>{props.payload.value}</text>)} 
            />
              <Tooltip
                formatter={(v: unknown) => [v as number, 'Projects']}
                contentStyle={TOOLTIP_STYLE}
              />
              <Bar dataKey="value" fill="#059669" radius={[0, 4, 4, 0]}>
                <LabelList dataKey="value" position="right" style={LABEL_STYLE} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </FigureCard>

        <FigureCard id="fig-proj-regions" label="Figure 10" title="Target Regions in Projects">
          <ResponsiveContainer width="100%" height={Math.max(260, projRegionData.length * 28)}>
            <BarChart data={projRegionData} layout="vertical" margin={{ left: 290, right: 30 }}>
              <XAxis type="number" tick={AXIS_TICK} />
              <YAxis 
              interval={0} 
              type="category" 
              dataKey="name" 
              width={290} 
              tick={(props: any) => (<text x={props.x - 5} y={props.y} dy={3} textAnchor="end" fill="#94A3B8" fontSize={10}>{props.payload.value}</text>)} 
            />
              <Tooltip
                formatter={(v: unknown) => [v as number, 'Projects']}
                contentStyle={TOOLTIP_STYLE}
              />
              <Bar dataKey="value" fill="#D97706" radius={[0, 4, 4, 0]}>
                <LabelList dataKey="value" position="right" style={LABEL_STYLE} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </FigureCard>

        {projByYear.length > 0 && (
          <FigureCard id="fig-proj-year" label="Figure 11" title="Number of Projects by Year">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={projByYear}>
                <XAxis dataKey="year" tick={AXIS_TICK} />
                <YAxis tick={AXIS_TICK} allowDecimals={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend />
                {['Erasmus+', 'TÜBİTAK 1001', 'Jean Monnet', 'COST'].map((t) => (
                  <Bar key={t} dataKey={t} stackId="a" fill={PROJE_COLORS_EN[t] ?? '#6B7280'} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </FigureCard>
        )}

      </Section>

      {/* ── SECTION 4: QUOTAS ────────────────────────────────────────────── */}
      <Section id="quotas" label="Section 4 · Student Quotas">

        <FigureCard id="fig-quota-location" label="Figure 12" title="Annual Student Quotas by Institutional Location (Stacked)">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={quotaByLocation}>
              <XAxis dataKey="year" tick={AXIS_TICK} />
              <YAxis tick={AXIS_TICK} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend />
              {(['Centre', 'Semi-Centre', 'Provincial'] as const).map((k) => (
                <Bar key={k} dataKey={k} name={k} stackId="a" fill={LOCATION_COLORS_EN[k]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </FigureCard>

        <FigureCard id="fig-quota-type" label="Figure 13" title="Annual Student Quotas: State vs. Foundation Universities">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={quotaByType}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="year" tick={AXIS_TICK} />
              <YAxis tick={AXIS_TICK} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend />
              <Line type="monotone" dataKey="State"       stroke="#1D4ED8" strokeWidth={2} dot />
              <Line type="monotone" dataKey="Foundation"  stroke="#7C3AED" strokeWidth={2} dot />
            </LineChart>
          </ResponsiveContainer>
        </FigureCard>

        <FigureCard id="fig-quota-trend" label="Figure 14" title="Total Student Quota Trend (2021–2025)">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={quotaTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="year" tick={AXIS_TICK} />
              <YAxis tick={AXIS_TICK} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Line type="monotone" dataKey="Total Quota" stroke="#0D9488" strokeWidth={2} dot />
            </LineChart>
          </ResponsiveContainer>
        </FigureCard>

        <FigureCard id="fig-quota-top" label="Figure 15" title="Top 15 Departments by 2025 Student Quota">
          <ResponsiveContainer width="100%" height={420}>
            <BarChart data={top2025} layout="vertical" margin={{ left: 290, right: 30 }}>
              <XAxis type="number" tick={AXIS_TICK} />
              <YAxis 
              interval={0} 
              type="category" 
              dataKey="bolum" 
              width={290} 
              tick={(props: any) => (<text x={props.x - 5} y={props.y} dy={3} textAnchor="end" fill="#94A3B8" fontSize={10}>{props.payload.value}</text>)} 
            />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="kontenjan" name="Quota" fill="#0D9488" radius={[0, 4, 4, 0]}>
                <LabelList dataKey="kontenjan" position="right" style={LABEL_STYLE} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </FigureCard>

        {/* Summary statistics table */}
        <FigureCard id="tbl-quota-summary" label="Table 1" title="Student Quota Summary by Year, Location, and Institution Type">
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-600">
                  <Th>Year</Th>
                  <Th right>Centre</Th>
                  <Th right>Semi-Centre</Th>
                  <Th right>Provincial</Th>
                  <Th right>State</Th>
                  <Th right>Foundation</Th>
                  <Th right className="text-teal-400">Total</Th>
                </tr>
              </thead>
              <tbody>
                {summaryTable.map((row) => (
                  <tr key={row.year} className="border-b border-slate-800 hover:bg-slate-800/30">
                    <Td>{row.year}</Td>
                    <Td right>{row.centre.toLocaleString('en-US')}</Td>
                    <Td right>{row.semiCentre.toLocaleString('en-US')}</Td>
                    <Td right>{row.provincial.toLocaleString('en-US')}</Td>
                    <Td right>{row.state.toLocaleString('en-US')}</Td>
                    <Td right>{row.foundation.toLocaleString('en-US')}</Td>
                    <Td right className="font-semibold text-teal-400">{row.total.toLocaleString('en-US')}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FigureCard>

        {/* Department-level raw data table */}
        <FigureCard id="tbl-quota-dept" label="Table 2" title="Department-Level Student Quotas — 2025">
          <div className="overflow-x-auto mt-2 max-h-[520px] overflow-y-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="sticky top-0 bg-slate-900">
                <tr className="border-b border-slate-600">
                  <Th>Department</Th>
                  <Th>University</Th>
                  <Th>Location</Th>
                  <Th>Type</Th>
                  <Th right className="text-teal-400">Quota</Th>
                </tr>
              </thead>
              <tbody>
                {KONTENJAN
                  .filter((d) => d.year === 2025)
                  .sort((a, b) => b.kontenjan - a.kontenjan)
                  .map((row, i) => (
                    <tr key={i} className="border-b border-slate-800 hover:bg-slate-800/30">
                      <Td>{row.bolum ?? '—'}</Td>
                      <Td className="text-slate-400">{row.universite ?? '—'}</Td>
                      <Td>{LOCATION_EN[row.konum] ?? row.konum}</Td>
                      <Td>{row.kurum_turu === 'devlet' ? 'State' : 'Foundation'}</Td>
                      <Td right className="font-semibold text-teal-400">{row.kontenjan.toLocaleString('en-US')}</Td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </FigureCard>

      </Section>

    </div>
  );
}

// ── Layout helpers ────────────────────────────────────────────────────────
function Section({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <section id={id} className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-slate-700" />
        <span className="text-xs font-mono text-teal-500 uppercase tracking-widest whitespace-nowrap">{label}</span>
        <div className="h-px flex-1 bg-slate-700" />
      </div>
      {children}
    </section>
  );
}

function FigureCard({
  id, label, title, children
}: {
  id: string; label: string; title: string; children: React.ReactNode;
}) {
  return (
    <div id={id} className="bg-slate-800/40 border border-slate-700 rounded-xl p-6">
      <div className="flex items-baseline gap-3 mb-4">
        <span className="text-xs font-mono text-teal-500 uppercase tracking-widest">{label}</span>
        <h2 className="text-sm font-semibold text-slate-200">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Th({ children, right, className = '' }: { children: React.ReactNode; right?: boolean; className?: string }) {
  return (
    <th className={`py-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wide ${right ? 'text-right' : ''} ${className}`}>
      {children}
    </th>
  );
}

function Td({ children, right, className = '' }: { children: React.ReactNode; right?: boolean; className?: string }) {
  return (
    <td className={`py-2 px-3 text-slate-300 ${right ? 'text-right tabular-nums' : ''} ${className}`}>
      {children}
    </td>
  );
}
