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

// ── Konu kodları K1–17 (akademisyen, yayın, tez) & T1–17 (proje) ────────────────
// Proje kod kitabına göredir (Analiz Açıklaması, 31.12.2025). 03.11.2026'da düzeltildi:
// önceki etiketler veriyle uyuşmuyordu (bkz. VERI_DEGISIKLIKLERI.md).
export const TOPIC_LABELS: Record<string, string> = {
  K1: 'Teori',                     T1: 'Teori',
  K2: 'Dış Politika',              T2: 'Dış Politika',
  K3: 'Güvenlik',                  T3: 'Güvenlik',
  K4: 'Çevre ve Enerji',           T4: 'Çevre ve Enerji',
  K5: 'Uluslararası Göç',          T5: 'Uluslararası Göç',
  K6: 'Toplumsal Cinsiyet',        T6: 'Toplumsal Cinsiyet',
  K7: 'Barış Çalışmaları',         T7: 'Barış Çalışmaları',
  K8: 'Terör',                     T8: 'Terör',
  K9: 'Uluslararası Hukuk',        T9: 'Uluslararası Hukuk',
  K10: 'Uluslararası Örgütler',    T10: 'Uluslararası Örgütler',
  K11: 'Dijitalleşme ve Medya',    T11: 'Dijitalleşme ve Medya',
  K12: 'Politik Ekonomi',          T12: 'Politik Ekonomi',
  K13: 'Kimlik ve Milliyetçilik',  T13: 'Kimlik ve Milliyetçilik',
  K14: 'Normatif Çalışmalar',      T14: 'Normatif Çalışmalar',
  K15: 'Küreselleşme',             T15: 'Küreselleşme',
  K16: 'Yöntem ve Disiplin',       T16: 'Yöntem ve Disiplin',
  K17: 'Avrupa Birliği',           T17: 'Avrupa Birliği',
};

// ── Bölge kodları B1–16 (akademisyen, yayın, tez) & R1–16 (proje) ───────────────
export const REGION_LABELS: Record<string, string> = {
  B1: 'Kuzey Amerika',          R1: 'Kuzey Amerika',
  B2: 'Güney Amerika',          R2: 'Güney Amerika',
  B3: 'Batı Avrupa',            R3: 'Batı Avrupa',
  B4: 'Merkez ve Doğu Avrupa',  R4: 'Merkez ve Doğu Avrupa',
  B5: 'Balkanlar',              R5: 'Balkanlar',
  B6: 'Asya',                   R6: 'Asya',
  B7: 'Güney Pasifik',          R7: 'Güney Pasifik',
  B8: 'Orta Doğu',              R8: 'Orta Doğu',
  B9: 'Kuzey Afrika',           R9: 'Kuzey Afrika',
  B10: 'Güney Afrika',          R10: 'Güney Afrika',
  B11: 'Avrasya',               R11: 'Avrasya',
  B12: 'Uzak Doğu / Pasifik',   R12: 'Uzak Doğu / Pasifik',
  B13: 'Karayipler',            R13: 'Karayipler',
  B14: 'Kutuplar',              R14: 'Kutuplar',
  B15: 'Rusya',                 R15: 'Rusya',
  B16: 'Türkiye',               R16: 'Türkiye',
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
