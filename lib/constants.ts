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

// ── Konu kodları K1–17 (akademisyen) & T1–17 (proje) ────────────────────────
export const TOPIC_LABELS: Record<string, string> = {
  K1:  'Uluslararası İlişkiler Teorisi',   T1:  'Uluslararası İlişkiler Teorisi',
  K2:  'Dış Politika',                       T2:  'Dış Politika',
  K3:  'Güvenlik Çalışmaları',               T3:  'Güvenlik Çalışmaları',
  K4:  'Uluslararası Politik Ekonomi',      T4:  'Uluslararası Politik Ekonomi',
  K5:  'Karşılaştırmalı Siyaset',           T5:  'Karşılaştırmalı Siyaset',
  K6:  'Toplumsal Cinsiyet & Kimlik',     T6:  'Toplumsal Cinsiyet & Kimlik',
  K7:  'İnsan Hakları',                      T7:  'İnsan Hakları',
  K8:  'Çevre & Enerji',                    T8:  'Çevre & Enerji',
  K9:  'Göç & Mültecilik',                  T9:  'Göç & Mültecilik',
  K10: 'Uluslararası Örgütler',             T10: 'Uluslararası Örgütler',
  K11: 'Diplomasi & Müzakere',             T11: 'Diplomasi & Müzakere',
  K12: 'Tarih & Siyasi Tarih',             T12: 'Tarih & Siyasi Tarih',
  K13: 'Bölge Çalışmaları',                 T13: 'Bölge Çalışmaları',
  K14: 'Kamu Yönetimi & Yerel Yönetim',   T14: 'Kamu Yönetimi & Yerel Yönetim',
  K15: 'Kültür & İletişim',                 T15: 'Kültür & İletişim',
  K16: 'Hukuk & Yönetişim',                T16: 'Hukuk & Yönetişim',
  K17: 'Avrupa Birliği',                   T17: 'Avrupa Birliği',
};

// ── Bölge kodları B1–16 (akademisyen) & R1–16 (proje) ───────────────────
export const REGION_LABELS: Record<string, string> = {
  B1:  'Kuzey Amerika',              R1:  'Kuzey Amerika',
  B2:  'Latin Amerika',              R2:  'Latin Amerika',
  B3:  'Batı Avrupa',               R3:  'Batı Avrupa',
  B4:  'Kuzey Avrupa',               R4:  'Kuzey Avrupa',
  B5:  'Güney Avrupa',               R5:  'Güney Avrupa',
  B6:  'Afrika',                     R6:  'Afrika',
  B7:  'Orta Asya',                  R7:  'Orta Asya',
  B8:  'Ortadoğu',                   R8:  'Ortadoğu',
  B9:  'Güney Asya',                 R9:  'Güney Asya',
  B10: 'Afrika (Alt-Sahra)',         R10: 'Afrika (Alt-Sahra)',
  B11: 'Doğu Asya',                  R11: 'Doğu Asya',
  B12: 'Güneydoğu Asya',            R12: 'Güneydoğu Asya',
  B13: 'Okyanusya',                  R13: 'Okyanusya',
  B14: 'Balkanlar & Doğu Avrupa',   R14: 'Balkanlar & Doğu Avrupa',
  B15: 'Kafkasya',                   R15: 'Kafkasya',
  B16: 'Türkiye',                    R16: 'Türkiye',
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
