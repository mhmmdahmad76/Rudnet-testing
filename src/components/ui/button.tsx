import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:bg-bg-disabled disabled:text-fg-disabled [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-bg-brand text-fg-on-brand hover:bg-bg-brand-hover focus-visible:shadow-[inset_0_0_0_2px_var(--fg-on-brand)]",
        secondary:
          "bg-bg-surface text-fg-primary border border-stroke-default hover:bg-bg-surface-hover",
        ghost: "bg-transparent text-fg-brand hover:bg-bg-hover",
        danger:
          "bg-bg-danger text-fg-on-brand hover:bg-bg-danger-hover focus-visible:shadow-[inset_0_0_0_2px_var(--fg-on-brand)]",
      },
      size: {
        sm: "h-(--size-control-sm) px-3 t-button-sm",
        md: "h-(--size-control-md) px-4 t-button-md",
        lg: "h-(--size-control-lg) px-5 t-button-lg",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  /** Trailing in LTR, leading in RTL — it is a direction indicator, not decoration. */
  icon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, loading = false, icon, disabled, children, ...props },
    ref,
  ) => {
    if (asChild) {
      return (
        <Slot
          ref={ref}
          className={cn(buttonVariants({ variant, size }), className)}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        <span>{children}</span>
        {loading ? <Loader2 className="animate-spin" aria-hidden /> : icon}
      </button>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
