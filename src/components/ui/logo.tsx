import Link from "next/link";
import { AudioLines } from "lucide-react";
import { cn } from "@/lib/cn";

export function Logo({
  dark = false,
}: {
  dark?: boolean;
}) {
  return (
    <Link
      href="/"
      className={cn("logo", dark && "logo-light")}
      aria-label="Vocalis home"
    >
      <span className="logo-symbol">
        <AudioLines size={23} strokeWidth={2.5} />
      </span>
      vocalis
      <span className="logo-dot">.</span>
    </Link>
  );
}
