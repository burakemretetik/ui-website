'use client';
import { usePathname } from 'next/navigation';
import { useFilterStore } from '@/hooks/useFilterStore';
import { TOPIC_LABELS, REGION_LABELS, KONUM_COLORS, KURUM_COLORS, YEAR_MIN, YEAR_MAX } from '@/lib/constants';
import { SECTION_FILTERS, type SectionId } from '@/lib/sectionFilters';
import type { Konum, KurumTuru } from '@/lib/types';

const KONUM_OPTIONS: { key: Konum; label: string }[] = [
  { key: 'merkez',      label: 'Merkez' },
  { key: 'yari_merkez', label: 'Yarı Merkez' },
  { key: 'tasra',       label: 'Taşra' },
];

const KURUM_OPTIONS: { key: KurumTuru; label: string }[] = [
  { key: 'devlet', label: 'Devlet' },
  { key: 'vakif',  label: 'Vakıf' },
];

function pathToSection(path: string): SectionId {
  if (path === '/') return 'home';
  const seg = path.replace('/', '');
  return (seg as SectionId) || 'home';
}

export default function FilterBar() {
  const pathname = usePathname();
  const section = pathToSection(pathname);
  const cfg = SECTION_FILTERS[section] ?? SECTION_FILTERS['home'];

  const {
    konum, toggleKonum,
    kurum_turu, toggleKurumTuru,
    topic_codes, setTopicCodes,
    region_codes, setRegionCodes,
    year_range, setYearRange,
    resetAll,
  } = useFilterStore();

  // Anasayfada veya hiç filtre yoksa bar'ı gizle
  if (!cfg.konum && !cfg.kurum_turu && !cfg.topic_codes && !cfg.region_codes && !cfg.year) {
    return null;
  }

  const hasActiveFilters =
    (cfg.topic_codes && topic_codes.length > 0) ||
    (cfg.region_codes && region_codes.length > 0) ||
    (cfg.year && (year_range[0] > YEAR_MIN || year_range[1] < YEAR_MAX));

  const toggleCode = (code: string, current: string[], setter: (c: string[]) => void) => {
    setter(current.includes(code) ? current.filter((c) => c !== code) : [...current, code]);
  };

  return (
    <div className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-700 shadow-lg">
      <div className="max-w-screen-xl mx-auto px-4 py-3">
        <div className="flex flex-wrap items-start gap-x-6 gap-y-2">

          {/* ── Konum ── */}
          {cfg.konum && (
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest whitespace-nowrap">Konum</span>
              <div className="flex gap-1">
                {KONUM_OPTIONS.map(({ key, label }) => {
                  const active = konum.has(key);
                  const isLast = konum.size === 1 && active; // tek kalan — disable
                  return (
                    <button
                      key={key}
                      onClick={() => toggleKonum(key)}
                      disabled={isLast}
                      title={isLast ? 'En az bir konum seçili olmalı' : undefined}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all border
                        ${isLast ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
                        ${active
                          ? 'text-white border-transparent'
                          : 'bg-transparent text-slate-400 border-slate-600 hover:border-slate-400'
                        }`}
                      style={active ? { backgroundColor: KONUM_COLORS[key], borderColor: KONUM_COLORS[key] } : {}}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Kurum Türü ── */}
          {cfg.kurum_turu && (
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest whitespace-nowrap">Kurum</span>
              <div className="flex gap-1">
                {KURUM_OPTIONS.map(({ key, label }) => {
                  const active = kurum_turu.has(key);
                  const isLast = kurum_turu.size === 1 && active;
                  return (
                    <button
                      key={key}
                      onClick={() => toggleKurumTuru(key)}
                      disabled={isLast}
                      title={isLast ? 'En az bir kurum türü seçili olmalı' : undefined}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all border
                        ${isLast ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
                        ${active
                          ? 'text-white border-transparent'
                          : 'bg-transparent text-slate-400 border-slate-600 hover:border-slate-400'
                        }`}
                      style={active ? { backgroundColor: KURUM_COLORS[key], borderColor: KURUM_COLORS[key] } : {}}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Yıl aralığı ── */}
          {cfg.year && (
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest whitespace-nowrap">Yıl</span>
              <YearRangePicker value={year_range} onChange={setYearRange} />
            </div>
          )}

          {/* ── Konu K kodları ── */}
          {cfg.topic_codes && (
            <div className="flex items-start gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest whitespace-nowrap pt-1">Konu</span>
              <div className="flex flex-wrap gap-1">
                {Object.entries(TOPIC_LABELS).filter(([code]) => code.startsWith('K')).map(([code, label]) => {
                  const active = topic_codes.includes(code);
                  return (
                    <button
                      key={code}
                      onClick={() => toggleCode(code, topic_codes, setTopicCodes)}
                      title={label}
                      className={`px-2 py-0.5 rounded text-xs font-mono transition-all border ${
                        active
                          ? 'bg-teal-600 border-teal-600 text-white'
                          : 'bg-transparent border-slate-600 text-slate-500 hover:border-teal-500 hover:text-teal-400'
                      }`}
                    >
                      {code}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Bölge B kodları ── */}
          {cfg.region_codes && (
            <div className="flex items-start gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest whitespace-nowrap pt-1">Bölge</span>
              <div className="flex flex-wrap gap-1">
                {Object.entries(REGION_LABELS).filter(([code]) => code.startsWith('B')).map(([code, label]) => {
                  const active = region_codes.includes(code);
                  return (
                    <button
                      key={code}
                      onClick={() => toggleCode(code, region_codes, setRegionCodes)}
                      title={label}
                      className={`px-2 py-0.5 rounded text-xs font-mono transition-all border ${
                        active
                          ? 'bg-amber-600 border-amber-600 text-white'
                          : 'bg-transparent border-slate-600 text-slate-500 hover:border-amber-500 hover:text-amber-400'
                      }`}
                    >
                      {code}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Sıfırla ── */}
          {hasActiveFilters && (
            <button
              onClick={resetAll}
              className="ml-auto self-center text-xs text-rose-400 hover:text-rose-300 border border-rose-800 hover:border-rose-500 px-3 py-1 rounded-full transition-all shrink-0"
            >
              ✕ Filtreleri sıfırla
            </button>
          )}

        </div>
      </div>
    </div>
  );
}

// ── Yıl aralığı seçici — buton tabanlı, slider değil ────────────────
function YearRangePicker({
  value,
  onChange,
}: {
  value: [number, number];
  onChange: (r: [number, number]) => void;
}) {
  const years = Array.from({ length: YEAR_MAX - YEAR_MIN + 1 }, (_, i) => YEAR_MIN + i);
  const [from, to] = value;

  return (
    <div className="flex items-center gap-1">
      {years.map((y) => {
        const inRange = y >= from && y <= to;
        const isEdge  = y === from || y === to;
        return (
          <button
            key={y}
            onClick={() => {
              if (y < from) onChange([y, to]);
              else if (y > to) onChange([from, y]);
              else if (y === from && from < to) onChange([y + 1, to]);
              else if (y === to && from < to) onChange([from, y - 1]);
              else if (from === to) {
                // tek yıl seçiliyse genişlet
                if (y > YEAR_MIN) onChange([y - 1, y]);
                else onChange([y, y + 1]);
              }
            }}
            className={`w-10 py-0.5 text-xs rounded transition-all font-mono
              ${isEdge  ? 'bg-teal-600 text-white font-bold' :
                inRange ? 'bg-teal-900 text-teal-300' :
                          'text-slate-500 hover:text-slate-300'}`}
          >
            {y}
          </button>
        );
      })}
      {(from > YEAR_MIN || to < YEAR_MAX) && (
        <button
          onClick={() => onChange([YEAR_MIN, YEAR_MAX])}
          className="ml-1 text-xs text-slate-500 hover:text-slate-300 px-1"
          title="Tüm yıllar"
        >
          ×
        </button>
      )}
    </div>
  );
}
