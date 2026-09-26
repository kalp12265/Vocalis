export function ScoreRing({
  score,
  size = 130,
}: {
  score: number;
  size?: number;
}) {
  return (
    <div className="score-ring" style={{ width: size, height: size }}>
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <circle
          cx="60"
          cy="60"
          r="52"
          fill="none"
          stroke="var(--border)"
          strokeWidth="7"
        />
        <circle
          cx="60"
          cy="60"
          r="52"
          fill="none"
          stroke="var(--orange)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${(score / 100) * 327} 327`}
          transform="rotate(-90 60 60)"
        />
      </svg>
      <div>
        <strong>{score}</strong>
        <small>/ 100</small>
      </div>
    </div>
  );
}
