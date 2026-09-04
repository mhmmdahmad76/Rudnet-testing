import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const iconChipVariants = cva("inline-flex shrink-0 items-center justify-center rounded-full", {
  variants: {
    tone: {
      neutral: "bg-bg-subtle text-fg-secondary",
      brand: "bg-bg-brand-subtle text-fg-brand",
      accent: "bg-bg-accent-subtle text-fg-accent",
      success: "bg-bg-success-subtle text-fg-success",
      warning: "bg-bg-warning-subtle text-fg-warning",
      danger: "bg-bg-danger-subtle text-fg-danger",
      achievement: "bg-bg-achievement-subtle text-fg-achievement",
      info: "bg-bg-info-subtle text-fg-info",
    },
    size: {
      sm: "size-9",
      md: "size-12",
      lg: "size-14",
    },
  },
  defaultVariants: { tone: "neutral", size: "md" },
});

const ICON_PX = { sm: 16, md: 20, lg: 24 } as const;

export interface IconChipProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof iconChipVariants> {
  icon: LucideIcon;
}

/** Pure presentation — no interaction, no focus. */
function IconChip({ className, tone, size, icon: Icon, ...props }: IconChipProps) {
  const resolvedSize = size ?? "md";
  return (
    <span className={cn(iconChipVariants({ tone, size }), className)} {...props}>
      <Icon size={ICON_PX[resolvedSize]} strokeWidth={2} aria-hidden />
    </span>
  );
}

export { IconChip };
