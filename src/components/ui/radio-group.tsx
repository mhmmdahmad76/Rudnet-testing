"use client";

import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";

import { cn } from "@/lib/utils";

const RadioGroup = React.forwardRef<
  React.ComponentRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentProps<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Root ref={ref} className={cn("flex flex-col gap-1", className)} {...props} />
));
RadioGroup.displayName = "RadioGroup";

export interface RadioGroupItemProps
  extends React.ComponentProps<typeof RadioGroupPrimitive.Item> {
  label?: string;
  description?: string;
}

const RadioGroupItem = React.forwardRef<
  React.ComponentRef<typeof RadioGroupPrimitive.Item>,
  RadioGroupItemProps
>(({ className, id, label, description, disabled, ...props }, ref) => {
  const generatedId = React.useId();
  const controlId = id ?? generatedId;

  const dot = (
    <RadioGroupPrimitive.Item
      ref={ref}
      id={controlId}
      disabled={disabled}
      className={cn(
        "peer flex size-5 shrink-0 items-center justify-center rounded-full border border-stroke-default bg-bg-surface outline-none transition-colors",
        "hover:border-stroke-strong",
        "data-[state=checked]:border-stroke-brand",
        "focus-visible:shadow-(--elev-focus)",
        "disabled:border-stroke-disabled disabled:bg-bg-disabled",
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <span className="size-2.5 rounded-full bg-bg-brand" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );

  if (!label && !description) return dot;

  return (
    <label
      htmlFor={controlId}
      className={cn(
        "flex min-h-11 cursor-pointer items-start gap-3 py-2",
        disabled && "cursor-not-allowed opacity-60",
      )}
    >
      {dot}
      <span className="flex flex-col gap-0.5">
        {label && <span className="t-label-md text-fg-primary">{label}</span>}
        {description && <span className="t-body-sm text-fg-tertiary">{description}</span>}
      </span>
    </label>
  );
});
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };
