import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const inputVariants = cva(
  "w-full rounded-md border border-stroke-default bg-bg-surface px-3 t-body-md text-fg-primary outline-none transition-colors placeholder:text-fg-placeholder focus-visible:border-stroke-focus focus-visible:shadow-(--elev-focus) disabled:bg-bg-disabled disabled:text-fg-disabled aria-[invalid=true]:border-[1.5px] aria-[invalid=true]:border-stroke-danger",
  {
    variants: {
      size: {
        md: "h-(--size-control-md)",
        lg: "h-(--size-control-lg)",
      },
    },
    defaultVariants: { size: "md" },
  },
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, size, type = "text", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(inputVariants({ size }), className)}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export { Input, inputVariants };
