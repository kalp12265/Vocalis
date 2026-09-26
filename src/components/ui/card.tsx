import { cn } from "@/lib/cn";

export function Card({
  children,
  className = "",
  as: Tag = "section",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "section" | "div" | "article";
}) {
  return <Tag className={cn("panel", className)}>{children}</Tag>;
}

export function CardHeader({
  title,
  description,
  action,
  children,
}: {
  title?: React.ReactNode;
  description?: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
}) {
  if (children) return <div className="panel-heading">{children}</div>;
  return (
    <div className="panel-heading">
      <div>
        {title && <h2>{title}</h2>}
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  );
}
