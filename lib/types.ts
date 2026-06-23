// ── Temel filtre alanları — her kayıtta bulunması zorunlu ─────────────
export type Konum = 'merkez' | 'yari_merkez' | 'tasra' | 'bilinmiyor';
export type KurumTuru = 'devlet' | 'vakif';

export interface BaseRecord {
  konum: Konum;
  kurum_turu: KurumTuru;
  year?: number | null;
  topic_codes?: string[];
  region_codes?: string[];
}

// ── Akademisyen ───────────────────────────────────────────────────────
export type AkademikUnvan =
  | 'Profesör'
  | 'Doçent'
  | 'Dr. Öğr. Üyesi'
  | 'Araştırma Görevlisi'
  | 'Öğretim Görevlisi'
  | 'Diğer';

export interface Akademisyen extends BaseRecord {
  id: number | null;
  ad_soyad: string | null;
  unvan: AkademikUnvan;
  cinsiyet: 'Erkek' | 'Kadın' | null;
  universite: string | null;
  bilim_alani: string | null;
  anahtar_kelime: string | null;
  wos_docs: number | null;
  h_index: number | null;
  atif: number | null;
}

// ── Yayın ─────────────────────────────────────────────────────────────
export interface Yayin extends BaseRecord {
  pub_type: 'makale' | 'kitap_bolumu';
  title: string | null;
  source: string | null;
  authors: string | null;
  q_rank: 'Q1' | 'Q2' | 'Q3' | 'Q4' | null;
  times_cited_wos: number | null;
  times_cited_all: number | null;
  wos_index: string | null;
  language: string | null;
}

// ── Kontenjan ─────────────────────────────────────────────────────────
export interface Kontenjan extends BaseRecord {
  universite: string | null;
  bolum: string | null;
  year: number;
  kontenjan: number;
}

// ── Müfredat ──────────────────────────────────────────────────────────
export type Seviye = 'Lisans' | 'Yüksek Lisans' | 'Doktora';

export interface DersKaydi extends BaseRecord {
  universite: string | null;
  ders_adi: string;
  seviye: Seviye;
  program: string | null;
  akts: number | null;
}

// ── Proje ─────────────────────────────────────────────────────────────
export type ProjeTuru = 'COST' | 'TÜBİTAK 1001' | 'Erasmus+' | 'Jean Monnet';

export interface Proje extends BaseRecord {
  proje_turu: ProjeTuru | string;
  proje_kodu: string | null;
  proje_adi: string | null;
  arastirmaci: string | null;
  universite: string | null;
  bolum: string | null;
}

// ── Vizyon & Misyon ───────────────────────────────────────────────────
export interface MisyonVizyon extends BaseRecord {
  universite: string;
  misyon: string | null;
  vizyon: string | null;
}

// ── Global filtre state ───────────────────────────────────────────────
export interface FilterState {
  konum: Set<Konum>;
  kurum_turu: Set<KurumTuru>;
  topic_codes: string[];
  region_codes: string[];
  years: Set<number>;
}
