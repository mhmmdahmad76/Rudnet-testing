"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { RadioGroup } from "@/components/ui/radio-group";
import { ChoiceCard } from "@/components/lisaan/choice-card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { OnboardingStepBar } from "@/components/lisaan/onboarding-step-bar";
import { getOnboardingAnswers, setOnboardingAnswers } from "@/lib/onboarding-store";
import { setOnboardingStep } from "@/app/(auth)/actions";

const PACES = [
  {
    value: "2",
    title: "2 days a week",
    description: "~25 minutes a day. B1 → B2 by around March 2027.",
  },
  {
    value: "4",
    title: "4 days a week",
    description: "~20 minutes a day. B1 → B2 by around November 2026.",
  },
  {
    value: "6",
    title: "6 days a week",
    description: "~15 minutes a day. B1 → B2 by around August 2026.",
  },
] as const;

export default function OnboardingPacePage() {
  const router = useRouter();
  const [pace, setPace] = React.useState<string>(() => getOnboardingAnswers().pace ?? "4");
  const [reminders, setReminders] = React.useState(() => getOnboardingAnswers().reminders ?? true);
  const [pending, setPending] = React.useState(false);

  async function next() {
    setPending(true);
    setOnboardingAnswers({ pace: pace as "2" | "4" | "6", reminders });
    await setOnboardingStep("plan");
    router.push("/onboarding/plan");
  }

  return (
    <div>
      <OnboardingStepBar step={3} loading={pending} />
      <h1 className="t-h2 mb-2 text-fg-primary">How often can you study?</h1>
      <p className="t-body-sm mb-6 text-fg-secondary">
        Pick honestly — the projection below is real, not aspirational.
      </p>

      <RadioGroup value={pace} onValueChange={setPace} disabled={pending} className="gap-3">
        {PACES.map((option) => (
          <ChoiceCard
            key={option.value}
            value={option.value}
            marker={option.value}
            title={option.title}
            description={option.description}
          />
        ))}
      </RadioGroup>

      <div className="mt-6 flex items-center justify-between rounded-xl border border-stroke-default bg-bg-surface p-4">
        <div>
          <p className="t-label-md text-fg-primary">Study reminders</p>
          <p className="t-body-xs text-fg-tertiary">A nudge on the days you plan to study.</p>
        </div>
        <Switch checked={reminders} onCheckedChange={setReminders} disabled={pending} />
      </div>

      <Button className="mt-8 w-full" loading={pending} onClick={next}>
        Continue
      </Button>
    </div>
  );
}
