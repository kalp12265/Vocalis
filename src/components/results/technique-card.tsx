import type { Technique } from "@/types";

export function TechniqueCard({
  technique,
  index,
  weaknessDetail,
}: {
  technique: Technique;
  index: number;
  weaknessDetail?: string;
}) {
  return (
    <article className="technique-card">
      <span className="tiny-label">
        TECHNIQUE 0{index + 1} · {technique.weakness.toUpperCase()}
      </span>
      <h3>{technique.name}</h3>
      {weaknessDetail && (
        <p>
          <b>What to work on:</b> {weaknessDetail}
        </p>
      )}
      <p>
        <b>Why it matters:</b> {technique.why}
      </p>
      <p>
        <b>What to do:</b> {technique.action}
      </p>
      <div className="practice-exercise">
        <strong>YOUR NEXT REP</strong>
        {technique.practice}
      </div>
    </article>
  );
}
