"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

export interface SwitchProps extends React.ComponentProps<typeof SwitchPrimitive.Root> {
  label?: string;
  description?: string;
}

/** The knob's travel direction mirrors in RTL. */
const Switch = React.forwardRef<React.ComponentRef<typeof SwitchPrimitive.Root>, SwitchProps>(
  ({ className, id, label, description, disabled, ...props }, ref) => {
    const generatedId = React.useId();
    const controlId = id ?? generatedId;

    const track = (
      <SwitchPrimitive.Root
        ref={ref}
        id={controlId}
        disabled={disabled}
        className={cn(
          "peer relative inline-flex h-6 w-10 shrink-0 items-center rounded-full bg-bg-muted outline-none transition-colors",
          "data-[state=checked]:bg-bg-brand",
          "focus-visible:shadow-(--elev-focus)",
          "disabled:bg-bg-disabled",
          className,
        )}
        {...props}
      >
        <SwitchPrimitive.Thumb
          className={cn(
            "pointer-events-none block size-5 translate-x-0.5 rounded-full bg-bg-surface shadow-(--elev-01) transition-transform",
            "data-[state=checked]:translate-x-[18px] rtl:data-[state=checked]:-translate-x-[18px]",
          )}
        />
      </SwitchPrimitive.Root>
    );

    if (!label && !description) return track;

    return (
      <label
        htmlFor={controlId}
        className={cn(
          "flex min-h-11 cursor-pointer items-center justify-between gap-3 py-2",
          disabled && "cursor-not-allowed opacity-60",
        )}
      >
        <span className="flex flex-col gap-0.5">
          {label && <span className="t-label-md text-fg-primary">{label}</span>}
          {description && <span className="t-body-sm text-fg-tertiary">{description}</span>}
        </span>
        {track}
      </label>
    );
  },
);
Switch.displayName = "Switch";

export { Switch };
