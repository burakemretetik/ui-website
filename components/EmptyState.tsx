'use client';
import { useFilterStore } from '@/hooks/useFilterStore';

export default function EmptyState({ label = 'kayıt' }: { label?: string }) {
  const { resetAll } = useFilterStore();
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
      <div className="text-4xl">🔍</div>
      <p className="text-slate-400 text-sm">
        Seçili filtrelere uyan {label} bulunamadı.
      </p>
      <button
        onClick={resetAll}
        className="text-xs text-teal-400 hover:text-teal-300 border border-teal-800 hover:border-teal-600 px-4 py-1.5 rounded-full transition-all"
      >
        Filtreleri sıfırla
      </button>
    </div>
  );
}
