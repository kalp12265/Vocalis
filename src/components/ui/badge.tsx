import { cn } from "@/lib/cn";

type BadgeVariant =
  | "subtle"
  | "points"
  | "improvement"
  | "difficulty"
  | "streak"
  | "demo";

type BadgeProps = {
  children: React.ReactNode;
  variant?: BadgeVariant;
  difficulty?: string;
  className?: string;
  icon?: React.ReactNode;
  style?: React.CSSProperties;
};

export function Badge({
  children,
  variant = "subtle",
  difficulty,
  className = "",
  icon,
  style,
}: BadgeProps) {
  if (variant === "difficulty" && difficulty) {
    return (
      <span
        className={cn("difficulty", difficulty.toLowerCase(), className)}
        style={style}
      >
        <i />
        {children}
      </span>
    );
  }

  if (variant === "points") {
    return (
      <span className={cn("points-badge", className)} style={style}>
        {icon}
        {children}
      </span>
    );
  }

  if (variant === "improvement") {
    return (
      <span className={cn("improvement-badge", className)} style={style}>
        {icon}
        {children}
      </span>
    );
  }

  if (variant === "streak") {
    return (
      <span className={cn("streak-badge", className)} style={style}>
        {icon}
        {children}
      </span>
    );
  }

  return (
    <span className={cn("subtle-tag", className)} style={style}>
      {icon}
      {children}
    </span>
  );
}
