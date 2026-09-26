import { cn } from "@/lib/cn";

/** Metric / skill progress bar used on session results and progress pages. */
export function Progress({
  value,
  max = 100,
  label,
  display,
  warn = false,
  className = "",
}: {
  value: number;
  max?: number;
  label?: string;
  display?: React.ReactNode;
  warn?: boolean;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className={cn("metric-row", className)}>
      {(label || display !== undefined) && (
        <div>
          {label && <span>{label}</span>}
          {display !== undefined && <b>{display}</b>}
        </div>
      )}
      <div
        className={cn("metric-track", warn && "orange-track")}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
      >
        <span style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/** Recording timer bar during a practice session. */
export function RecordProgress({
  value,
  max,
  warning = false,
}: {
  value: number;
  max: number;
  warning?: boolean;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div
      className={cn("record-progress", warning && "warning")}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label="Recording time"
    >
      <i style={{ width: `${pct}%` }} />
    </div>
  );
}

/** Step dots for onboarding or multi-step flows. */
export function StepProgress({
  step,
  total,
  label,
}: {
  step: number;
  total: number;
  label?: string;
}) {
  return (
    <div
      className="onboarding-progress"
      aria-label={label || `Step ${step + 1} of ${total}`}
    >
      {Array.from({ length: total }, (_, n) => (
        <span className={n <= step ? "active" : ""} key={n} />
      ))}
    </div>
  );
}
