interface SectionHeaderProps {
  title: string;
  description?: string;
  count?: number;
  countLabel?: string;
}

export default function SectionHeader({ title, description, count, countLabel }: SectionHeaderProps) {
  return (
    <div className="mb-8 pb-4 border-b border-slate-700/50">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
        {count !== undefined && (
          <span className="text-sm text-slate-400 font-mono">
            <span className="text-teal-400 font-bold">{count.toLocaleString('tr-TR')}</span>
            {' '}{countLabel ?? 'kayıt'}
          </span>
        )}
      </div>
      {description && (
        <p className="mt-2 text-sm text-slate-400 max-w-2xl">{description}</p>
      )}
    </div>
  );
}
