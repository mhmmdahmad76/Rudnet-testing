"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

/** Character counter lives in the footer row when `maxLength` is set. */
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, maxLength, defaultValue, value, onChange, ...props }, ref) => {
    const [length, setLength] = React.useState(() => String(value ?? defaultValue ?? "").length);

    return (
      <div className="flex flex-col gap-1">
        <textarea
          ref={ref}
          maxLength={maxLength}
          defaultValue={defaultValue}
          value={value}
          onChange={(event) => {
            setLength(event.target.value.length);
            onChange?.(event);
          }}
          className={cn(
            "min-h-24 w-full resize-y rounded-md border border-stroke-default bg-bg-surface px-3 py-2 t-body-md text-fg-primary outline-none transition-colors placeholder:text-fg-placeholder focus-visible:border-stroke-focus focus-visible:shadow-(--elev-focus) disabled:bg-bg-disabled disabled:text-fg-disabled aria-[invalid=true]:border-[1.5px] aria-[invalid=true]:border-stroke-danger",
            className,
          )}
          {...props}
        />
        {typeof maxLength === "number" && (
          <p
            className={cn(
              "t-body-xs self-end",
              length > maxLength ? "text-fg-danger" : "text-fg-tertiary",
            )}
          >
            {length}/{maxLength}
          </p>
        )}
      </div>
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
