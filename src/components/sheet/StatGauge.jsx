export default function StatGauge({ icon, label, value, max, color }) {
  const colors = color === 'rose' ? { bar: 'bg-rose-600', text: 'text-rose-300' } : { bar: 'bg-cyan-500', text: 'text-cyan-300' };
  return (
    <div className="flex items-center gap-1.5">
      {icon}<span className="text-neutral-400">{label}</span>
      <div className="w-24 h-2.5 bg-neutral-900 rounded border border-neutral-700 overflow-hidden">
        <div className={`h-full ${colors.bar} transition-all duration-300`} style={{ width: `${(value / max) * 100}%` }} />
      </div>
      <span className={`font-bold ${colors.text}`}>{value}/{max}</span>
    </div>
  );
}
