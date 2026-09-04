import { cn } from "@/lib/utils";

export interface OnboardingStepBarProps {
  step: number;
  total?: number;
  className?: string;
}

/** Deleted, not hidden, on the post-checkout screens. */
function OnboardingStepBar({ step, total = 4, className }: OnboardingStepBarProps) {
  return (
    <div
      role="progressbar"
      aria-valuenow={step}
      aria-valuemin={1}
      aria-valuemax={total}
      className={cn("mb-8 flex gap-2", className)}
    >
      {Array.from({ length: total }).map((_, index) => (
        <div
          key={index}
          className={cn("h-1.5 flex-1 rounded-full", index < step ? "bg-bg-brand" : "bg-bg-muted")}
        />
      ))}
    </div>
  );
}

export { OnboardingStepBar };
