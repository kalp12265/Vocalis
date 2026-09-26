import { ArrowRight, Mic } from "lucide-react";
import { ButtonLink } from "./button";

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="empty-state">
      <span className="icon-box orange">
        <Mic />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      <ButtonLink href="/practice">
        Start a session <ArrowRight size={17} />
      </ButtonLink>
    </div>
  );
}
