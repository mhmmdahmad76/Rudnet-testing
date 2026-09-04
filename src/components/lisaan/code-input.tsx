"use client";

import * as React from "react";
import { OTPInput } from "input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";

import { cn } from "@/lib/utils";

export interface CodeInputProps {
  length?: number;
  value?: string;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  error?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
  "aria-label"?: string;
}

/**
 * Digit order stays LTR even in RTL — it is a number, not a word. On error
 * all six digits go to the error style, not just the last one.
 */
function CodeInput({
  length = 6,
  value,
  onChange,
  onComplete,
  error,
  disabled,
  autoFocus,
  className,
  ...props
}: CodeInputProps) {
  return (
    <div dir="ltr" className={cn("w-fit", className)}>
      <OTPInput
        maxLength={length}
        value={value}
        onChange={onChange}
        onComplete={onComplete}
        disabled={disabled}
        autoFocus={autoFocus}
        inputMode="numeric"
        pattern={REGEXP_ONLY_DIGITS}
        containerClassName="flex gap-2"
        aria-label={props["aria-label"] ?? "Verification code"}
        render={({ slots }) => (
          <>
            {slots.map((slot, index) => (
              <CodeDigit
                key={index}
                char={slot.char}
                isActive={slot.isActive}
                hasFakeCaret={slot.hasFakeCaret}
                error={error}
              />
            ))}
          </>
        )}
      />
    </div>
  );
}

interface CodeDigitProps {
  char: string | null;
  isActive: boolean;
  hasFakeCaret: boolean;
  error?: boolean;
}

function CodeDigit({ char, isActive, hasFakeCaret, error }: CodeDigitProps) {
  return (
    <div
      className={cn(
        "t-numeric-lg relative flex h-14 w-[58px] items-center justify-center rounded-md border bg-bg-surface text-fg-primary transition-colors",
        error
          ? "border-[1.5px] border-stroke-danger"
          : isActive
            ? "border-stroke-focus shadow-(--elev-focus)"
            : "border-stroke-default",
      )}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-5 w-px animate-pulse bg-fg-primary" />
        </div>
      )}
    </div>
  );
}

export { CodeInput, CodeDigit };
