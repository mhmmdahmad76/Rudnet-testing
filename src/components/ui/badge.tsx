import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "t-body-xs inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 w-fit whitespace-nowrap",
  {
    variants: {
      tone: {
        neutral: "bg-bg-subtle text-fg-secondary",
        brand: "bg-bg-brand-subtle text-fg-brand",
        success: "bg-bg-success-subtle text-fg-success",
        warning: "bg-bg-warning-subtle text-fg-warning",
        danger: "bg-bg-danger-subtle text-fg-danger",
        achievement: "bg-bg-achievement-subtle text-fg-achievement",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

function Badge({ className, tone, dot = true, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ tone }), className)} {...props}>
      {dot && <span className="size-1.5 shrink-0 rounded-full bg-current" aria-hidden />}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
