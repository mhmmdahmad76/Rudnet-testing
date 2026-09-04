"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { OnboardingStepBar } from "@/components/lisaan/onboarding-step-bar";
import { cn } from "@/lib/utils";
import { getOnboardingAnswers, setOnboardingAnswers } from "@/lib/onboarding-store";
import { ONBOARDING_STEP_COOKIE, setDemoCookie } from "@/lib/session";

const GOALS = [
  { value: "work", title: "Work", description: "Emails, calls, and meetings in English." },
  { value: "exam", title: "IELTS / TOEFL", description: "Preparing for a language exam." },
  { value: "university", title: "University", description: "Studying abroad or applying to one." },
  { value: "travel", title: "Travel", description: "Getting around comfortably when you travel." },
  { value: "general", title: "General fluency", description: "No specific goal — just getting better." },
];

export default function OnboardingGoalPage() {
  const router = useRouter();
  const [goals, setGoals] = React.useState<string[]>(() => getOnboardingAnswers().goals ?? []);

  function toggle(value: string) {
    setGoals((current) =>
      current.includes(value) ? current.filter((v) => v !== value) : [...current, value],
    );
  }

  function next() {
    setOnboardingAnswers({ goals });
    setDemoCookie(ONBOARDING_STEP_COOKIE, "pace");
    router.push("/onboarding/pace");
  }

  return (
    <div>
      <OnboardingStepBar step={2} />
      <h1 className="t-h2 mb-2 text-fg-primary">What are you working towards?</h1>
      <p className="t-body-sm mb-6 text-fg-secondary">Pick as many as apply.</p>

      <div className="flex flex-col gap-3">
        {GOALS.map((goal) => {
          const selected = goals.includes(goal.value);
          return (
            <button
              key={goal.value}
              type="button"
              onClick={() => toggle(goal.value)}
              aria-pressed={selected}
              className={cn(
                "flex w-full items-start gap-3 rounded-xl border p-4 text-start outline-none transition-colors focus-visible:shadow-(--elev-focus)",
                selected
                  ? "border-stroke-brand bg-bg-brand-subtle"
                  : "border-stroke-default bg-bg-surface hover:border-stroke-strong",
              )}
            >
              <span className="flex-1">
                <span className="t-label-lg block text-fg-primary">{goal.title}</span>
                <span className="t-body-sm text-fg-tertiary">{goal.description}</span>
              </span>
              <span
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full border",
                  selected ? "border-stroke-brand bg-bg-brand text-fg-on-brand" : "border-stroke-default",
                )}
              >
                {selected && <Check className="size-3.5" aria-hidden />}
              </span>
            </button>
          );
        })}
      </div>

      <Button className="mt-8 w-full" disabled={goals.length === 0} onClick={next}>
        Continue
      </Button>
    </div>
  );
}
