import { Target } from "lucide-react";
import { Card, Progress } from "@/components/ui";
import type { Metric } from "@/types";

export function MetricsGrid({
  metrics,
  note,
}: {
  metrics: Record<Metric, number>;
  note?: string;
}) {
  return (
    <Card>
      <h2 className="feedback-title">
        <Target />
        Your speaking metrics
      </h2>
      <div className="metric-grid">
        {Object.entries(metrics).map(([name, value]) => (
          <Progress
            key={name}
            label={name}
            value={value}
            display={`${value} / 100`}
            warn={value < 75}
          />
        ))}
      </div>
      {note && <p className="muted-note">{note}</p>}
    </Card>
  );
}

export function ModeMetrics({
  title,
  metrics,
}: {
  title: string;
  metrics: Record<string, number>;
}) {
  return (
    <Card>
      <h2 className="feedback-title">
        <Target />
        {title}
      </h2>
      {Object.entries(metrics).map(([name, value]) => (
        <Progress key={name} label={name} value={value} display={value} />
      ))}
      <p className="muted-note">
        Text-based indicators for this practice mode. Listen to your recording
        for pacing and delivery.
      </p>
    </Card>
  );
}
