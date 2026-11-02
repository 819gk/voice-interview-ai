const STYLES = {
  correct: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30',
  partial: 'bg-amber-500/15 text-amber-300 ring-amber-500/30',
  incorrect: 'bg-rose-500/15 text-rose-300 ring-rose-500/30',
};

const LABELS = { correct: 'Correct', partial: 'Partially correct', incorrect: 'Incorrect' };

export default function VerdictBadge({ verdict, score }) {
  if (!verdict) return null;

  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${STYLES[verdict]}`}>
      {LABELS[verdict]}
      {typeof score === 'number' && <span className="opacity-80">{score}/10</span>}
    </span>
  );
}
