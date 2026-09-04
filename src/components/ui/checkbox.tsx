"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check, Minus } from "lucide-react";

import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends Omit<
    React.ComponentProps<typeof CheckboxPrimitive.Root>,
    "checked" | "onCheckedChange"
  > {
  checked: boolean | "indeterminate";
  onCheckedChange?: (checked: boolean | "indeterminate") => void;
  label?: string;
  description?: string;
}

/** Indeterminate is a real state here — the students table header uses it. */
const Checkbox = React.forwardRef<React.ComponentRef<typeof CheckboxPrimitive.Root>, CheckboxProps>(
  ({ className, checked, onCheckedChange, label, description, id, disabled, ...props }, ref) => {
    const generatedId = React.useId();
    const controlId = id ?? generatedId;

    const box = (
      <CheckboxPrimitive.Root
        ref={ref}
        id={controlId}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className={cn(
          "peer flex size-5 shrink-0 items-center justify-center rounded-[6px] border border-stroke-default bg-bg-surface transition-colors outline-none",
          "hover:border-stroke-strong",
          "data-[state=checked]:border-stroke-brand data-[state=checked]:bg-bg-brand data-[state=checked]:text-fg-on-brand",
          "data-[state=indeterminate]:border-stroke-brand data-[state=indeterminate]:bg-bg-brand data-[state=indeterminate]:text-fg-on-brand",
          "focus-visible:shadow-(--elev-focus)",
          "disabled:border-stroke-disabled disabled:bg-bg-disabled disabled:text-fg-disabled",
          className,
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator className="flex items-center justify-center">
          {checked === "indeterminate" ? (
            <Minus className="size-3.5" aria-hidden />
          ) : (
            <Check className="size-3.5" aria-hidden />
          )}
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
    );

    if (!label && !description) return box;

    return (
      <label
        htmlFor={controlId}
        className={cn(
          "flex min-h-11 cursor-pointer items-start gap-3 py-2",
          disabled && "cursor-not-allowed opacity-60",
        )}
      >
        {box}
        <span className="flex flex-col gap-0.5">
          {label && <span className="t-label-md text-fg-primary">{label}</span>}
          {description && <span className="t-body-sm text-fg-tertiary">{description}</span>}
        </span>
      </label>
    );
  },
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
