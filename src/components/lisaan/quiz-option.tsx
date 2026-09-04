import * as React from "react";
import { Check, X } from "lucide-react";

import { cn } from "@/lib/utils";

const MARKER_TONE = {
  default: "border-stroke-default text-fg-secondary",
  selected: "border-stroke-brand bg-bg-brand text-fg-on-brand",
  correct: "border-stroke-success bg-bg-success-subtle text-fg-success",
  incorrect: "border-stroke-danger bg-bg-danger-subtle text-fg-danger",
} as const;

const OPTION_TONE = {
  default: "border-stroke-default bg-bg-surface hover:border-stroke-strong",
  selected: "border-stroke-brand bg-bg-brand-subtle",
  correct: "border-stroke-success bg-bg-success-subtle",
  incorrect: "border-stroke-danger bg-bg-danger-subtle",
} as const;

export interface QuizOptionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  answer: "default" | "selected" | "correct" | "incorrect";
  marker: string;
}

/** Correct and incorrect always carry an icon as well as the colour — never colour alone. */
const QuizOption = React.forwardRef<HTMLButtonElement, QuizOptionProps>(
  ({ className, answer, marker, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "flex w-full items-center gap-3 rounded-xl border p-4 text-start outline-none transition-colors focus-visible:shadow-(--elev-focus)",
          OPTION_TONE[answer],
          className,
        )}
        {...props}
      >
        <span
          className={cn(
            "t-label-md flex size-8 shrink-0 items-center justify-center rounded-full border",
            MARKER_TONE[answer],
          )}
        >
          {marker}
        </span>
        <span className="t-body-md flex-1 text-fg-primary">{children}</span>
        {answer === "correct" && (
          <Check className="size-5 shrink-0 text-fg-success" aria-hidden />
        )}
        {answer === "incorrect" && <X className="size-5 shrink-0 text-fg-danger" aria-hidden />}
      </button>
    );
  },
);
QuizOption.displayName = "QuizOption";

export { QuizOption };
