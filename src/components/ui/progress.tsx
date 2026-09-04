"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const trackVariants = cva("relative w-full overflow-hidden rounded-full bg-bg-muted", {
  variants: {
    size: {
      xs: "h-1.5",
      md: "h-2",
    },
  },
  defaultVariants: { size: "md" },
});

export interface ProgressProps
  extends Omit<React.ComponentProps<typeof ProgressPrimitive.Root>, "value">,
    VariantProps<typeof trackVariants> {
  value: number;
}

/**
 * Sizes the fill by `width`, never `translateX` — the shadcn default pushes
 * the fill clean out of the track under dir="rtl".
 */
function Progress({ className, value, size, ...props }: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <ProgressPrimitive.Root
      className={cn(trackVariants({ size }), className)}
      value={clamped}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full rounded-full bg-bg-brand transition-[width] duration-(--dur-base) ease-(--ease-standard)"
        style={{ width: `${clamped}%` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
