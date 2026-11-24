// Ders adı birleştirme ve "en sık dersler" hesabı.
// Drive'daki müfredat analiziyle (mufredat_analiz.py, 24.11.2026) aynı kural:
// yalnız yazım farkı olan başlıklar aynı ders sayılır — büyük/küçük harf, Türkçe karakter (I/İ/ı),
// noktalama ve sondaki 1/I, 2/II, 3/III, 4/IV. Adı farklı dersler (içerikçe benzer olsa da) birleşmez.

const TR_ASCII: Record<string, string> = { ç: 'c', ğ: 'g', ı: 'i', ş: 's', ö: 'o', ü: 'u', â: 'a', î: 'i', û: 'u' };

export function dersAnahtari(ad: string): string {
  let s = ad.replace(/İ/g, 'i').replace(/I/g, 'ı').toLowerCase();
  s = s.replace(/[çğışöüâîû]/g, (c) => TR_ASCII[c]);
  s = s.normalize('NFKD').replace(/[^\x00-\x7f]/g, '');
  s = s.replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
  s = s.replace(/([a-z])(\d)$/, '$1 $2');
  s = s.replace(/ (1|i)$/, ' i').replace(/ (2|ii)$/, ' ii').replace(/ (3|iii)$/, ' iii').replace(/ (4|iv)$/, ' iv');
  return s;
}

const cmp = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0); // Python ile aynı (kod noktası) sıralama

// Her ders için görünen ad: tüm veride en sık yazım (eşitlikte alfabetik ilk).
// Filtrelenmiş alt kümede de aynı ad görünsün diye tüm veriden bir kez hesaplanır.
export function gorunenAdlar(rows: { ders_adi: string }[]): Map<string, string> {
  const say = new Map<string, Map<string, number>>();
  for (const r of rows) {
    const k = dersAnahtari(r.ders_adi);
    const m = say.get(k) ?? new Map<string, number>(); say.set(k, m);
    m.set(r.ders_adi, (m.get(r.ders_adi) ?? 0) + 1);
  }
  const out = new Map<string, string>();
  for (const [k, m] of say) out.set(k, [...m.entries()].sort((a, b) => b[1] - a[1] || cmp(a[0], b[0]))[0][0]);
  return out;
}

export interface DersSikligi {
  anahtar: string;
  ders: string;          // görünen ad (gorunenAdlar)
  universite: number;    // dersin geçtiği farklı üniversite sayısı
  kayit: number;
  ortAkts: number | null; // yalnız AKTS > 0 kayıtlar ("." / "-" ve 0 AKTS hesaba girmez)
}

interface DersSatiri { universite: string | null; ders_adi: string; akts: number | null }

export function enSikDersler(rows: DersSatiri[], adlar: Map<string, string>, n = 20): DersSikligi[] {
  const g = new Map<string, { uni: Set<string>; kayit: number; aktsT: number; aktsN: number }>();
  for (const r of rows) {
    const k = dersAnahtari(r.ders_adi);
    let o = g.get(k);
    if (!o) { o = { uni: new Set(), kayit: 0, aktsT: 0, aktsN: 0 }; g.set(k, o); }
    if (r.universite) o.uni.add(r.universite);
    o.kayit++;
    if (r.akts != null && r.akts > 0) { o.aktsT += r.akts; o.aktsN++; }
  }
  const out: DersSikligi[] = [];
  for (const [anahtar, o] of g) {
    const ders = adlar.get(anahtar) ?? anahtar;
    out.push({ anahtar, ders, universite: o.uni.size, kayit: o.kayit, ortAkts: o.aktsN ? o.aktsT / o.aktsN : null });
  }
  return out.sort((a, b) => b.universite - a.universite || b.kayit - a.kayit || cmp(a.ders, b.ders)).slice(0, n);
}
