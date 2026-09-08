import { cn } from "@/lib/utils";

export interface OnboardingStepBarProps {
  step: number;
  total?: number;
  /** True while the next step is being saved — pulses the upcoming segment
   * instead of leaving the bar looking frozen during the wait. */
  loading?: boolean;
  className?: string;
}

/** Deleted, not hidden, on the post-checkout screens. */
function OnboardingStepBar({ step, total = 4, loading, className }: OnboardingStepBarProps) {
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
          className={cn(
            "h-1.5 flex-1 rounded-full transition-colors duration-300",
            index < step ? "bg-bg-brand" : "bg-bg-muted",
            loading && index === step && "animate-pulse bg-bg-brand/40",
          )}
        />
      ))}
    </div>
  );
}

export { OnboardingStepBar };
