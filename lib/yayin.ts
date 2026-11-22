// Yayın analizi 2000–2025 (dört InCites grubu) — hesap fonksiyonları.
// React'tan bağımsızdır; scripts/yayin/ altındaki Python analiziyle (Drive'daki tablolar) aynı kuralları uygular:
// - Sayımlar tüm belge türleriyle; atıf, CNCI ve "en çok atıf alan %10" yalnız Article + Review ile.
// - Bir yayın her kategoride (konum, kurum türü, konu, bölge) en fazla bir kez sayılır.
// - Yüzdeler, ilgili kodu olan yayınlar içindeki paydır.

export type GrupId = 'ir_esci' | 'ir_ssci' | 'sb_esci' | 'sb_ssci';
export type YKonum = 'merkez' | 'yari_merkez' | 'tasra' | 'yurt_disi';
export type YTur = 'devlet' | 'vakif' | 'yurt_disi';

export interface YayinPub {
  t: string;          // başlık
  j: number;          // dergi sırası (dergiler[])
  y: number | null;   // yayın yılı
  d: number;          // belge türü sırası (belge_turleri[])
  c: number;          // işbirliği türü sırası (isbirligi[])
  k?: YKonum[];       // kurum konumları (yayın başına benzersiz)
  u?: YTur[];         // kurum türleri
  tc?: string[];      // konu kodları K1–K17
  rc?: string[];      // bölge kodları B1–B16
}

export interface YayinData {
  meta: { kaynak: string; tarih: string; gruplar: { id: GrupId; ad: string }[]; etki_belge_turleri: string[] };
  dergiler: string[];
  belge_turleri: string[];
  isbirligi: string[];
  yayinlar: YayinPub[];
  // [yayın sırası, Times Cited, CNCI, Percentile in Subject Area]
  gruplar: Record<GrupId, [number, number | null, number | null, number | null][]>;
}

export interface GrupKayit {
  pub: YayinPub;
  tc: number | null;
  cnci: number | null;
  pct: number | null;
  arastirma: boolean; // Article veya Review
}

export const GRUP_KISA: Record<GrupId, string> = {
  ir_esci: 'Uİ · ESCI dahil',
  ir_ssci: 'Uİ · ESCI hariç',
  sb_esci: 'SB · ESCI dahil',
  sb_ssci: 'SB · ESCI hariç',
};

export const YKONUM_SIRA: YKonum[] = ['merkez', 'yari_merkez', 'tasra', 'yurt_disi'];
export const YTUR_SIRA: YTur[] = ['devlet', 'vakif', 'yurt_disi'];
export const DONEMLER = ['2000–2004', '2005–2009', '2010–2014', '2015–2019', '2020–2025'] as const;

export function donem(y: number | null): string | null {
  if (y == null || y < 2000 || y > 2025) return null;
  return DONEMLER[Math.min(Math.floor((y - 2000) / 5), 4)];
}

export function grupKayitlari(data: YayinData, grup: GrupId): GrupKayit[] {
  const etkiTurleri = new Set(data.meta.etki_belge_turleri);
  return data.gruplar[grup].map(([i, tc, cnci, pct]) => {
    const pub = data.yayinlar[i];
    return { pub, tc, cnci, pct, arastirma: etkiTurleri.has(data.belge_turleri[pub.d]) };
  });
}

export interface YayinFiltre {
  konum: Set<string>;      // seçili Türkiye konumları (merkez, yari_merkez, tasra)
  kurum: Set<string>;      // seçili kurum türleri (devlet, vakif)
  years: Set<number>;      // boş = tüm yıllar
  topics: string[];        // boş = filtre yok; doluysa herhangi biri
  regions: string[];
}

// Konum/kurum filtresi: üç konumun (iki kurum türünün) hepsi seçiliyken filtre uygulanmaz.
// Seçim daraltılınca yalnız seçili kategorilerden en az birinde kurumu olan yayınlar kalır;
// konum (tür) kodu olmayan yayınlar bu durumda gösterilmez — Drive tablolarındaki kırılımlarla aynı.
export function filtrele(rows: GrupKayit[], f: YayinFiltre): GrupKayit[] {
  const konumDar = f.konum.size < 3;
  const kurumDar = f.kurum.size < 2;
  return rows.filter(({ pub }) => {
    if (konumDar && !(pub.k ?? []).some((k) => f.konum.has(k))) return false;
    if (kurumDar && !(pub.u ?? []).some((k) => f.kurum.has(k))) return false;
    if (f.years.size > 0 && (pub.y == null || !f.years.has(pub.y))) return false;
    if (f.topics.length > 0 && !(pub.tc ?? []).some((c) => f.topics.includes(c))) return false;
    if (f.regions.length > 0 && !(pub.rc ?? []).some((c) => f.regions.includes(c))) return false;
    return true;
  });
}

function median(xs: number[]): number | null {
  if (xs.length === 0) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function mean(xs: number[]): number | null {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
}

export interface Etki {
  n: number;                 // makale + derleme
  toplamAtif: number;
  ortAtif: number | null;
  medAtif: number | null;
  atifsizPct: number | null; // hiç atıf almamış %
  cnciOrt: number | null;
  cnciMed: number | null;
  top10Pct: number | null;   // Percentile in Subject Area ≥ 90
}

export function etki(rows: GrupKayit[]): Etki {
  const a = rows.filter((r) => r.arastirma);
  const tcs = a.map((r) => r.tc).filter((v): v is number => v != null);
  const cn = a.map((r) => r.cnci).filter((v): v is number => v != null);
  const pc = a.map((r) => r.pct);
  return {
    n: a.length,
    toplamAtif: tcs.reduce((s, v) => s + v, 0),
    ortAtif: mean(tcs),
    medAtif: median(tcs),
    atifsizPct: a.length ? (100 * tcs.filter((v) => v === 0).length) / a.length : null,
    cnciOrt: mean(cn),
    cnciMed: median(cn),
    top10Pct: a.length ? (100 * pc.filter((v) => v != null && v >= 90).length) / a.length : null,
  };
}

type UyelikAlani = 'k' | 'u' | 'tc' | 'rc';

export interface UyelikSatiri { kod: string; n: number; pct: number | null }

// Her kategori için o kategoride en az bir kodu olan yayın sayısı ve kodlu yayınlar içindeki payı.
export function uyelik(rows: GrupKayit[], alan: UyelikAlani, kategoriler: readonly string[]): { satirlar: UyelikSatiri[]; kodlu: number } {
  const kodlu = rows.filter((r) => (r.pub[alan] ?? []).length > 0).length;
  const satirlar = kategoriler.map((kod) => {
    const n = rows.filter((r) => ((r.pub[alan] ?? []) as string[]).includes(kod)).length;
    return { kod, n, pct: kodlu ? (100 * n) / kodlu : null };
  });
  return { satirlar, kodlu };
}

export function sahip(rows: GrupKayit[], alan: UyelikAlani, kod: string): GrupKayit[] {
  return rows.filter((r) => ((r.pub[alan] ?? []) as string[]).includes(kod));
}

export function yillik(rows: GrupKayit[]): { yil: number; arastirma: number; diger: number }[] {
  const out: { yil: number; arastirma: number; diger: number }[] = [];
  for (let y = 2000; y <= 2025; y++) out.push({ yil: y, arastirma: 0, diger: 0 });
  rows.forEach((r) => {
    if (r.pub.y == null || r.pub.y < 2000 || r.pub.y > 2025) return;
    const o = out[r.pub.y - 2000];
    if (r.arastirma) o.arastirma++; else o.diger++;
  });
  return out;
}

export function enCokAtif(rows: GrupKayit[], n = 10): GrupKayit[] {
  return rows
    .filter((r) => r.arastirma && r.tc != null)
    .sort((a, b) => (b.tc ?? 0) - (a.tc ?? 0) || (b.cnci ?? 0) - (a.cnci ?? 0))
    .slice(0, n);
}

// Drive'daki tablolarla (pandas/numpy round) aynı gösterim için: ölçekle, yarımı çifte yuvarla.
// toFixed ikilik tabandaki tam değere baktığı için 0.2955 gibi sınır değerlerde farklı sonuç verebilir.
export function yuvarla(x: number, d: number): number {
  const f = 10 ** d;
  const y = x * f;
  const fl = Math.floor(y);
  const diff = y - fl;
  const r = diff > 0.5 ? fl + 1 : diff < 0.5 ? fl : (fl % 2 === 0 ? fl : fl + 1);
  return r / f;
}

// Türkçe sayı gösterimi (ondalık ayırıcı virgül); null → "–"
export function sayi(x: number | null | undefined, d = 0): string {
  if (x == null || Number.isNaN(x)) return '–';
  return yuvarla(x, d).toLocaleString('tr-TR', { minimumFractionDigits: d, maximumFractionDigits: d });
}
