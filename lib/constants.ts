// ── Renk paleti — her konum kategorisi için sabit renk ────────────────
export const KONUM_COLORS: Record<string, string> = {
  merkez:       '#0D9488', // teal-600
  yari_merkez:  '#D97706', // amber-600
  tasra:        '#DC2626', // rose-600
  bilinmiyor:   '#6B7280', // gray-500
};

export const KONUM_LABELS: Record<string, string> = {
  merkez:      'Merkez',
  yari_merkez: 'Yarı Merkez',
  tasra:       'Taşra',
  bilinmiyor:  'Bilinmiyor',
};

export const KURUM_COLORS: Record<string, string> = {
  devlet: '#1D4ED8', // blue-700
  vakif:  '#7C3AED', // violet-600
};

export const KURUM_LABELS: Record<string, string> = {
  devlet: 'Devlet',
  vakif:  'Vakıf',
};

// ── Konu kodları K1–K17 ───────────────────────────────────────────────
export const TOPIC_LABELS: Record<string, string> = {
  K1:  'Uluslararası İlişkiler Teorisi',
  K2:  'Dış Politika',
  K3:  'Güvenlik Çalışmaları',
  K4:  'Uluslararası Politik Ekonomi',
  K5:  'Karşılaştırmalı Siyaset',
  K6:  'Toplumsal Cinsiyet & Kimlik',
  K7:  'İnsan Hakları',
  K8:  'Çevre & Enerji',
  K9:  'Göç & Mültecilik',
  K10: 'Uluslararası Örgütler',
  K11: 'Diplomasi & Müzakere',
  K12: 'Tarih & Siyasi Tarih',
  K13: 'Bölge Çalışmaları',
  K14: 'Kamu Yönetimi & Yerel Yönetim',
  K15: 'Kültür & İletişim',
  K16: 'Hukuk & Yönetişim',
  K17: 'Avrupa Birliği',
};

// ── Bölge kodları B1–B16 ──────────────────────────────────────────────
export const REGION_LABELS: Record<string, string> = {
  B1:  'Kuzey Amerika',
  B2:  'Latin Amerika',
  B3:  'Batı Avrupa',
  B4:  'Kuzey Avrupa',
  B5:  'Güney Avrupa',
  B6:  'Afrika',
  B7:  'Orta Asya',
  B8:  'Ortadoğu',
  B9:  'Güney Asya',
  B10: 'Afrika (Alt-Sahra)',
  B11: 'Doğu Asya',
  B12: 'Güneydoğu Asya',
  B13: 'Okyanusya',
  B14: 'Balkanlar & Doğu Avrupa',
  B15: 'Kafkasya',
  B16: 'Türkiye',
};

// ── Proje türü renkleri ───────────────────────────────────────────────
export const PROJE_COLORS: Record<string, string> = {
  'COST':          '#059669', // emerald-600
  'TÜBİTAK 1001': '#2563EB', // blue-600
  'Erasmus+':      '#7C3AED', // violet-600
  'Jean Monnet':   '#D97706', // amber-600
};

// ── Q sıralaması renkleri ─────────────────────────────────────────────
export const Q_COLORS: Record<string, string> = {
  Q1: '#065F46',
  Q2: '#0D9488',
  Q3: '#D97706',
  Q4: '#DC2626',
};

// ── Yıl aralığı ───────────────────────────────────────────────────────
export const YEAR_MIN = 2018;
export const YEAR_MAX = 2025;

// ── Unvan sıralaması (bar chart için) ────────────────────────────────
export const UNVAN_ORDER = [
  'Profesör',
  'Doçent',
  'Dr. Öğr. Üyesi',
  'Araştırma Görevlisi',
  'Öğretim Görevlisi',
  'Diğer',
];
