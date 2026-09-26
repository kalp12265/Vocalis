import Link from "next/link";
import { cn } from "@/lib/cn";

export function Avatar({
  name,
  size = "md",
  href,
  className = "",
}: {
  name?: string;
  size?: "sm" | "md" | "lg";
  href?: string;
  className?: string;
}) {
  const initial = name?.trim().slice(0, 1).toUpperCase() || "Y";
  const classes = cn("profile-avatar", size === "sm" && "small", className);

  if (href) {
    return (
      <Link href={href} className={classes} aria-label="Open profile">
        {initial}
      </Link>
    );
  }

  return <span className={classes}>{initial}</span>;
}
