import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const iconButtonVariants = cva(
  "inline-flex items-center justify-center rounded-lg transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:bg-bg-disabled disabled:text-fg-disabled [&_svg]:size-5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        ghost: "bg-transparent text-fg-secondary hover:bg-bg-hover",
        secondary:
          "bg-bg-surface text-fg-primary border border-stroke-default hover:bg-bg-surface-hover",
      },
      size: {
        sm: "size-8",
        md: "size-10",
      },
    },
    defaultVariants: { variant: "ghost", size: "md" },
  },
);

export interface IconButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "aria-label">,
    VariantProps<typeof iconButtonVariants> {
  asChild?: boolean;
  /** Required — this button carries no visible label. */
  "aria-label": string;
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(iconButtonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
IconButton.displayName = "IconButton";

export { IconButton, iconButtonVariants };
