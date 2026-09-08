"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { IconChip } from "@/components/lisaan/icon-chip";
import { OnboardingStepBar } from "@/components/lisaan/onboarding-step-bar";
import { cn } from "@/lib/utils";
import { submitPlacementTest } from "@/app/(auth)/actions";
import type { PublicPlacementQuestion } from "@/lib/placement-test";

const ADVANCE_DELAY_MS = 350;

export function PlacementTestClient({ questions }: { questions: PublicPlacementQuestion[] }) {
  const router = useRouter();
  const [index, setIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, number>>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [result, setResult] = React.useState<{ score: number; total: number; level: string } | null>(null);

  const question = questions[index];

  async function choose(optionIndex: number) {
    const next = { ...answers, [question.id]: optionIndex };
    setAnswers(next);

    await new Promise((resolve) => setTimeout(resolve, ADVANCE_DELAY_MS));

    if (index < questions.length - 1) {
      setIndex((i) => i + 1);
      return;
    }

    setSubmitting(true);
    const outcome = await submitPlacementTest(next);
    setSubmitting(false);
    if (outcome.ok) setResult(outcome);
  }

  if (result) {
    return (
      <div className="flex flex-col items-center gap-6 text-center">
        <IconChip icon={Check} tone="success" size="lg" />
        <div className="flex flex-col gap-2">
          <h1 className="t-h2 text-fg-primary">You&rsquo;re a {result.level}</h1>
          <p className="t-body-sm max-w-sm text-fg-secondary">
            You got {result.score} of {result.total} right. Your lessons are set to match — you can
            always retake this later from account settings.
          </p>
        </div>
        <Button size="lg" className="w-full" onClick={() => router.push("/dashboard")}>
          Go to my dashboard
        </Button>
      </div>
    );
  }

  return (
    <div>
      <OnboardingStepBar step={index + 1} total={questions.length} />
      <p className="t-overline mb-2 text-fg-tertiary">
        Question {index + 1} of {questions.length}
      </p>
      <h1 className="t-h2 mb-6 text-fg-primary">{question.prompt}</h1>

      <div className="flex flex-col gap-3">
        {question.options.map((option, optionIndex) => (
          <button
            key={option}
            type="button"
            disabled={submitting || answers[question.id] !== undefined}
            onClick={() => choose(optionIndex)}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl border p-4 text-start outline-none transition-colors focus-visible:shadow-(--elev-focus)",
              answers[question.id] === optionIndex
                ? "border-stroke-brand bg-bg-brand-subtle"
                : "border-stroke-default bg-bg-surface hover:border-stroke-strong",
              "disabled:cursor-not-allowed",
            )}
          >
            <span
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                answers[question.id] === optionIndex
                  ? "border-stroke-brand bg-bg-brand text-fg-on-brand"
                  : "border-stroke-default text-fg-tertiary",
              )}
            >
              {String.fromCharCode(65 + optionIndex)}
            </span>
            <span className="t-body-md text-fg-primary">{option}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
