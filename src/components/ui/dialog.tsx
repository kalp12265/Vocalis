"use client";

import { X } from "lucide-react";
import { useDialogAccessibility } from "@/hooks/use-dialog";
import { cn } from "@/lib/cn";
import { Button } from "./button";

export function Dialog({
  open,
  onClose,
  title,
  titleId = "dialog-title",
  description,
  descriptionId,
  children,
  className = "",
  alert = false,
}: {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  titleId?: string;
  description?: React.ReactNode;
  descriptionId?: string;
  children: React.ReactNode;
  className?: string;
  alert?: boolean;
}) {
  useDialogAccessibility(open, onClose);
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <section
        className={cn("modal", className)}
        role={alert ? "alertdialog" : "dialog"}
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
        }}
      >
        <Button
          variant="ghost"
          className="modal-close"
          aria-label="Close dialog"
          onClick={onClose}
        >
          <X />
        </Button>
        {title && <h2 id={titleId}>{title}</h2>}
        {description && <p id={descriptionId}>{description}</p>}
        {children}
      </section>
    </div>
  );
}
