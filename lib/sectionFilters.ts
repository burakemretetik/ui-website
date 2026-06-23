// Her section hangi filtreleri destekliyor?
// Bu config FilterBar'ın hangi kontrolleri aktif/pasif göstereceğini belirler.

export type SectionId =
  | 'akademisyen'
  | 'yayin'
  | 'kontenjan'
  | 'mufredat'
  | 'projeler'
  | 'misyon-vizyon'
  | 'home';

export interface SectionFilterConfig {
  konum: boolean;
  kurum_turu: boolean;
  topic_codes: boolean;
  region_codes: boolean;
  year: boolean;
  yearMin?: number;
  yearMax?: number;
}

export const SECTION_FILTERS: Record<SectionId, SectionFilterConfig> = {
  home:           { konum: false, kurum_turu: false, topic_codes: false, region_codes: false, year: false },
  akademisyen:    { konum: true,  kurum_turu: true,  topic_codes: true,  region_codes: true,  year: false },
  yayin:          { konum: true,  kurum_turu: true,  topic_codes: true,  region_codes: true,  year: true,  yearMin: 2018, yearMax: 2023 },
  kontenjan:      { konum: true,  kurum_turu: true,  topic_codes: false, region_codes: false, year: true,  yearMin: 2021, yearMax: 2025 },
  mufredat:       { konum: true,  kurum_turu: true,  topic_codes: false, region_codes: false, year: false },
  projeler:       { konum: true,  kurum_turu: true,  topic_codes: true,  region_codes: true,  year: true,  yearMin: 2021, yearMax: 2024 },
  'misyon-vizyon':{ konum: true,  kurum_turu: true,  topic_codes: false, region_codes: false, year: false },
};
