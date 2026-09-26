import Link from "next/link";
import { ArrowUpRight, Mic } from "lucide-react";
import type { Category } from "@/types";
import { iconMap } from "./icons";
import { Badge } from "./badge";
import { cn } from "@/lib/cn";

export function CategoryCard({
  category,
  compact = false,
}: {
  category: Category;
  compact?: boolean;
}) {
  const Icon = iconMap[category.icon] || Mic;
  return (
    <Link
      href={`/practice/${category.id}`}
      className={cn("category-card", compact && "compact")}
    >
      <div className="category-card-top">
        <span className={`icon-box ${category.color}`}>
          <Icon size={22} />
        </span>
        <ArrowUpRight className="category-arrow" size={18} />
      </div>
      <h3>{category.name}</h3>
      <p>{category.description}</p>
      <div className="category-meta">
        <Badge variant="difficulty" difficulty={category.difficulty}>
          {category.difficulty}
        </Badge>
        <span>
          {["random", "chaotic"].includes(category.id)
            ? "Surprise prompts"
            : `${category.prompts.length} prompts`}
        </span>
      </div>
    </Link>
  );
}
