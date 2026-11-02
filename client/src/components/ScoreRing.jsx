const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const colorFor = (score) =>
  score >= 80 ? '#34d399' : score >= 60 ? '#818cf8' : score >= 40 ? '#fbbf24' : '#f87171';

export default function ScoreRing({ score }) {
  const offset = CIRCUMFERENCE * (1 - score / 100);

  return (
    <div className="relative h-36 w-36" role="img" aria-label={`Score ${score} out of 100`}>
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={RADIUS} fill="none" stroke="#1e293b" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={RADIUS}
          fill="none"
          stroke={colorFor(score)}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-white">{score}</span>
        <span className="text-xs text-slate-400">out of 100</span>
      </div>
    </div>
  );
}
