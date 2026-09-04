"use client";

import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export interface ChoiceCardProps
  extends Omit<React.ComponentProps<typeof RadioGroupPrimitive.Item>, "children"> {
  marker: string;
  title: string;
  description: string;
}

/** Whole card is the hit target. Built on radio-group so arrow keys move between options. */
const ChoiceCard = React.forwardRef<
  React.ComponentRef<typeof RadioGroupPrimitive.Item>,
  ChoiceCardProps
>(({ className, marker, title, description, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "group flex w-full items-start gap-3 rounded-xl border border-stroke-default bg-bg-surface p-4 text-start outline-none transition-colors",
        "hover:border-stroke-strong",
        "data-[state=checked]:border-stroke-brand data-[state=checked]:bg-bg-brand-subtle",
        "focus-visible:shadow-(--elev-focus)",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    >
      <span className="t-label-md flex size-8 shrink-0 items-center justify-center rounded-lg bg-bg-subtle text-fg-secondary group-data-[state=checked]:bg-bg-brand group-data-[state=checked]:text-fg-on-brand">
        {marker}
      </span>
      <span className="flex flex-1 flex-col gap-0.5">
        <span className="t-label-lg text-fg-primary">{title}</span>
        <span className="t-body-sm text-fg-tertiary">{description}</span>
      </span>
      <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-stroke-default text-fg-on-brand group-data-[state=checked]:border-stroke-brand group-data-[state=checked]:bg-bg-brand">
        <RadioGroupPrimitive.Indicator>
          <Check className="size-3.5" aria-hidden />
        </RadioGroupPrimitive.Indicator>
      </span>
    </RadioGroupPrimitive.Item>
  );
});
ChoiceCard.displayName = "ChoiceCard";

export { ChoiceCard };
