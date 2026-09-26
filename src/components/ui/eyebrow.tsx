import { Check } from "lucide-react";

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="eyebrow">
      <span />
      {children}
    </div>
  );
}

export function CheckLine({ children }: { children: React.ReactNode }) {
  return (
    <span className="check-line">
      <Check size={14} />
      {children}
    </span>
  );
}
