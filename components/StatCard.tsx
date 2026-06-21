interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  color?: string; // tailwind text color class
}

export default function StatCard({ label, value, sub, color = 'text-teal-400' }: StatCardProps) {
  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-5 flex flex-col gap-1 hover:border-slate-500 transition-colors">
      <span className={`text-3xl font-bold tabular-nums ${color}`}>{value}</span>
      <span className="text-sm font-medium text-slate-200">{label}</span>
      {sub && <span className="text-xs text-slate-500">{sub}</span>}
    </div>
  );
}
