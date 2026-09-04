"use client";

import * as React from "react";
import { ChevronDown, X } from "lucide-react";

import { cn } from "@/lib/utils";

export interface FilterTriggerProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "value"> {
  label: string;
  /** Presence switches the trigger to the applied look, shown inline. */
  value?: string;
  open?: boolean;
  disabled?: boolean;
  onClear?: () => void;
}

const FilterTrigger = React.forwardRef<HTMLButtonElement, FilterTriggerProps>(
  ({ className, label, value, open, disabled, onClear, ...props }, ref) => {
    const applied = Boolean(value);

    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        aria-expanded={open}
        className={cn(
          "t-label-md relative inline-flex h-(--size-control-md) items-center gap-1.5 rounded-md border bg-bg-surface ps-3 pe-3 text-fg-primary outline-none transition-colors",
          "hover:bg-bg-surface-hover",
          "focus-visible:shadow-(--elev-focus)",
          open ? "border-stroke-brand" : "border-stroke-default",
          applied && "bg-bg-brand-subtle text-fg-brand hover:bg-bg-brand-subtle",
          applied && onClear && "pe-8",
          disabled && "pointer-events-none opacity-60",
          className,
        )}
        {...props}
      >
        <span>
          {label}
          {applied && <span className="text-fg-tertiary"> · {value}</span>}
        </span>
        {!applied && (
          <ChevronDown
            className={cn("size-4 shrink-0 transition-transform", open && "rotate-180")}
            aria-hidden
          />
        )}
        {applied && onClear && (
          <span
            role="button"
            tabIndex={0}
            aria-label={`Clear ${label} filter`}
            onClick={(event) => {
              event.stopPropagation();
              onClear();
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.stopPropagation();
                event.preventDefault();
                onClear();
              }
            }}
            className="absolute end-1.5 flex size-5 items-center justify-center rounded-full outline-none hover:bg-bg-hover focus-visible:shadow-(--elev-focus)"
          >
            <X className="size-3.5" aria-hidden />
          </span>
        )}
      </button>
    );
  },
);
FilterTrigger.displayName = "FilterTrigger";

export { FilterTrigger };
