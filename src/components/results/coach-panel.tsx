import { Sparkles, ArrowUpRight } from "lucide-react";
import { ButtonLink, Card } from "@/components/ui";

export function CoachPanel({
  feedback,
  retryHref,
}: {
  feedback: string;
  retryHref: string;
}) {
  return (
    <Card className="coach-panel">
      <h2 className="feedback-title">
        <Sparkles />
        Your Vocalis Coach
      </h2>
      <p>{feedback}</p>
      <ButtonLink href={retryHref}>
        Try again with this technique <ArrowUpRight size={14} />
      </ButtonLink>
    </Card>
  );
}
