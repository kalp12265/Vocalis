import { NextResponse } from "next/server";
import { categories, getCategory } from "@/data/topics";
export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("mode") || "everyday-life";
  const category = getCategory(mode);
  const previous = url.searchParams.get("previous");
  const pool =
    mode === "random"
      ? categories.filter((c) => c.id !== "chaotic").flatMap((c) => c.prompts)
      : category.prompts;
  const choices = pool.filter((p) => p !== previous);
  const prompt = choices[Math.floor(Math.random() * choices.length)] || pool[0];
  return NextResponse.json({
    prompt,
    category: category.id,
    side:
      mode === "debate"
        ? Math.random() > 0.5
          ? "ARGUE FOR"
          : "ARGUE AGAINST"
        : null,
  });
}
