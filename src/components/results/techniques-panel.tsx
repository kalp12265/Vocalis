import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import type { Technique } from "@/types";
import { Card } from "@/components/ui";
import { TechniqueCard } from "./technique-card";

export function TechniquesPanel({
  techniques,
  weakAreas,
  voiceCoach,
}: {
  techniques: Technique[];
  weakAreas: { name: string; detail: string }[];
  voiceCoach?: ReactNode;
}) {
  return (
    <Card>
      <h2 className="feedback-title">
        <Sparkles />
        Small techniques. Big difference.
      </h2>
      <p className="muted-note" style={{ marginTop: -8 }}>
        Turn your next opportunity into something you can practice.
      </p>
      {voiceCoach}
      {techniques.map((t, i) => (
        <TechniqueCard
          key={`${t.weakness}-${t.name}`}
          technique={t}
          index={i}
          weaknessDetail={weakAreas.find((w) => w.name === t.weakness)?.detail}
        />
      ))}
    </Card>
  );
}
