"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { RadioGroup } from "@/components/ui/radio-group";
import { ChoiceCard } from "@/components/lisaan/choice-card";
import { Button } from "@/components/ui/button";
import { OnboardingStepBar } from "@/components/lisaan/onboarding-step-bar";
import { getOnboardingAnswers, setOnboardingAnswers } from "@/lib/onboarding-store";
import { ONBOARDING_STEP_COOKIE, setDemoCookie } from "@/lib/session";

const LEVELS = [
  { value: "A1", title: "Beginner", description: "I know a few words and phrases." },
  { value: "A2", title: "Elementary", description: "I can have simple conversations about familiar topics." },
  { value: "B1", title: "Intermediate", description: "I can talk about routine tasks and give my opinion." },
  { value: "B2", title: "Upper intermediate", description: "I can discuss most topics, even with some hesitation." },
  { value: "C1", title: "Advanced", description: "I can communicate fluently in almost any situation." },
];

export default function OnboardingLevelPage() {
  const router = useRouter();
  const [level, setLevel] = React.useState(() => getOnboardingAnswers().level ?? "");

  function goTo(nextLevel: string) {
    setOnboardingAnswers({ level: nextLevel });
    setDemoCookie(ONBOARDING_STEP_COOKIE, "goal");
    router.push("/onboarding/goal");
  }

  return (
    <div>
      <OnboardingStepBar step={1} />
      <h1 className="t-h2 mb-2 text-fg-primary">What's your English level?</h1>
      <p className="t-body-sm mb-6 text-fg-secondary">
        Pick the description closest to you — every answer here is editable later from account
        settings.
      </p>

      <RadioGroup value={level} onValueChange={setLevel} className="gap-3">
        {LEVELS.map((option) => (
          <ChoiceCard
            key={option.value}
            value={option.value}
            marker={option.value}
            title={option.title}
            description={option.description}
          />
        ))}
      </RadioGroup>

      <button
        type="button"
        onClick={() => goTo("unsure")}
        className="t-label-sm mt-4 text-fg-link hover:text-fg-link-hover"
      >
        Not sure — take the five-minute check
      </button>

      <Button className="mt-8 w-full" disabled={!level} onClick={() => goTo(level)}>
        Continue
      </Button>
    </div>
  );
}
