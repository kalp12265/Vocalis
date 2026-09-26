import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export function StatCard({
  icon: Icon,
  label,
  value,
  detail,
  positive = false,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  detail: string;
  positive?: boolean;
}) {
  return (
    <div className="stat-card">
      <div className="stat-label">
        <span>{label}</span>
        <Icon size={17} />
      </div>
      <strong>{value}</strong>
      <small className={cn(positive && "positive")}>{detail}</small>
    </div>
  );
}
