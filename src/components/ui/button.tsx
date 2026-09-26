import Link from "next/link";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "text";

const variantClass: Record<ButtonVariant, string> = {
  primary: "button button-primary",
  secondary: "button button-secondary",
  ghost: "icon-button",
  text: "text-button",
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button className={cn(variantClass[variant], className)} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  children,
  secondary = false,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  secondary?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "button",
        secondary ? "button-secondary" : "button-primary",
        className,
      )}
    >
      {children}
    </Link>
  );
}
