import type { ReactNode } from "react";
import { Card, Badge } from "@/components/ui";

type FeedbackItem = { title: string; detail: string };

export function FeedbackList({
  title,
  icon,
  items,
  empty,
  titleClassName,
  itemClassName,
  footer,
}: {
  title: string;
  icon: ReactNode;
  items: FeedbackItem[];
  empty?: string;
  titleClassName?: string;
  itemClassName?: string;
  footer?: ReactNode;
}) {
  return (
    <Card>
      <h2 className={titleClassName || "feedback-title"}>
        {icon}
        {title}
      </h2>
      {items.length ? (
        items.map((item, i) => (
          <div className={itemClassName || "feedback-item"} key={i}>
            <h4>{item.title}</h4>
            <p>{item.detail}</p>
          </div>
        ))
      ) : empty ? (
        <p className="muted-note">{empty}</p>
      ) : null}
      {footer}
    </Card>
  );
}

export function FillerBadges({
  fillers,
}: {
  fillers: { word: string; count: number }[];
}) {
  if (!fillers.length) return null;
  return (
    <div className="pill-filters" style={{ marginTop: 18, marginBottom: 0 }}>
      {fillers.map((f) => (
        <Badge key={f.word}>
          {f.word} × {f.count}
        </Badge>
      ))}
    </div>
  );
}
