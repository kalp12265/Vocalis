import { Target } from "lucide-react";
import { Card } from "@/components/ui";

export function WeakAreas({
  areas,
}: {
  areas: { name: string; detail: string }[];
}) {
  return (
    <Card>
      <h2 className="feedback-title">
        <Target />
        Your weak areas
      </h2>
      {areas.map((w, i) => (
        <div className="weak-area" key={i}>
          <span>{i + 1}</span>
          <div>
            <h4>{w.name}</h4>
            <p>{w.detail}</p>
          </div>
        </div>
      ))}
    </Card>
  );
}
