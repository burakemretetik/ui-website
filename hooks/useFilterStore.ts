'use client';
import { create } from 'zustand';
import type { FilterState, Konum, KurumTuru } from '@/lib/types';
import { YEAR_MIN, YEAR_MAX } from '@/lib/constants';

interface FilterActions {
  toggleKonum: (k: Konum) => void;
  toggleKurumTuru: (k: KurumTuru) => void;
  setTopicCodes: (codes: string[]) => void;
  setRegionCodes: (codes: string[]) => void;
  setYearRange: (range: [number, number]) => void;
  resetAll: () => void;
}

const DEFAULT_STATE: FilterState = {
  konum:        new Set<Konum>(['merkez', 'yari_merkez', 'tasra']),
  kurum_turu:   new Set<KurumTuru>(['devlet', 'vakif']),
  topic_codes:  [],
  region_codes: [],
  year_range:   [YEAR_MIN, YEAR_MAX],
};

export const useFilterStore = create<FilterState & FilterActions>((set) => ({
  ...DEFAULT_STATE,

  toggleKonum: (k) =>
    set((s) => {
      const next = new Set(s.konum);
      if (next.has(k)) {
        // En az 1 aktif kalmalı
        if (next.size === 1) return {};
        next.delete(k);
      } else {
        next.add(k);
      }
      return { konum: next };
    }),

  toggleKurumTuru: (k) =>
    set((s) => {
      const next = new Set(s.kurum_turu);
      if (next.has(k)) {
        if (next.size === 1) return {};
        next.delete(k);
      } else {
        next.add(k);
      }
      return { kurum_turu: next };
    }),

  setTopicCodes:  (codes) => set({ topic_codes: codes }),
  setRegionCodes: (codes) => set({ region_codes: codes }),
  setYearRange:   (range) => set({ year_range: range }),

  resetAll: () =>
    set({
      konum:        new Set<Konum>(['merkez', 'yari_merkez', 'tasra']),
      kurum_turu:   new Set<KurumTuru>(['devlet', 'vakif']),
      topic_codes:  [],
      region_codes: [],
      year_range:   [YEAR_MIN, YEAR_MAX],
    }),
}));
