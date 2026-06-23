'use client';
import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useFilterStore } from './useFilterStore';
import { SECTION_FILTERS, type SectionId } from '@/lib/sectionFilters';
import type { BaseRecord } from '@/lib/types';

function pathToSection(path: string): SectionId {
  if (path === '/') return 'home';
  const seg = path.replace('/', '');
  return (seg as SectionId) || 'home';
}

/**
 * Projenin ana hook'u.
 * Aktif sayfanın hangi filtreleri desteklediğini SECTION_FILTERS'dan okur,
 * sadece o filtreleri uygular. Desteklenmeyen filtreler (örn. misyon-vizyon
 * için topic_codes) veriyi etkilemez.
 */
export function useFilteredData<T extends BaseRecord>(data: T[]): T[] {
  const pathname = usePathname();
  const section  = pathToSection(pathname);
  const cfg      = SECTION_FILTERS[section] ?? SECTION_FILTERS['home'];

  const { konum, kurum_turu, topic_codes, region_codes, years } = useFilterStore();

  return useMemo(() => {
    return data.filter((rec) => {

      // 1. Konum — her section için geçerli
      // 'bilinmiyor' konumlu kayıtlar (kitap bölümü gibi) her zaman dahil edilir;
      // üniversite bilgisi olmayan kayıtları konum filtresiyle eleyemeyiz.
      if (cfg.konum && rec.konum !== 'bilinmiyor') {
        if (!konum.has(rec.konum as any)) return false;
      }

      // 2. Kurum türü — her section için geçerli
      if (cfg.kurum_turu && !kurum_turu.has(rec.kurum_turu)) return false;

      // 3. Yıl — sadece year:true olan sectionlar için, boş set = filtre yok
      // year=null olan kayıtlar yıl seçiliyken gizlenir, sadece Tümü'nde görünür
      if (cfg.year && years.size > 0) {
        if (rec.year == null || !years.has(rec.year)) return false;
      }

      // 4. Konu kodu — sadece topic_codes:true olan sectionlar ve filtre seçilmişse
      if (cfg.topic_codes && topic_codes.length > 0) {
        const recTopics = rec.topic_codes ?? [];
        if (!topic_codes.some((c) => recTopics.includes(c))) return false;
      }

      // 5. Bölge kodu — sadece region_codes:true olan sectionlar ve filtre seçilmişse
      if (cfg.region_codes && region_codes.length > 0) {
        const recRegions = rec.region_codes ?? [];
        if (!region_codes.some((c) => recRegions.includes(c))) return false;
      }

      return true;
    });
  }, [data, cfg, konum, kurum_turu, topic_codes, region_codes, years]);
}
