export default function TrafficScoreBadge({ score = 50, level = 'Moderate', size = 'sm' }) {
  const getPillStyle = () => {
    switch (level?.toLowerCase()) {
      case 'low':
        return 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60';
      case 'high':
        return 'bg-red-950/80 text-red-300 border border-red-800/60';
      case 'severe':
        return 'bg-red-950 text-red-200 border border-red-700 font-bold';
      default:
        return 'bg-amber-950/80 text-amber-300 border border-amber-800/60';
    }
  };

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs ${getPillStyle()}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      <span className="font-semibold uppercase tracking-tight text-[10px]">{level}</span>
      <span className="font-mono text-[10px] opacity-75">{score}/100</span>
    </div>
  );
}
