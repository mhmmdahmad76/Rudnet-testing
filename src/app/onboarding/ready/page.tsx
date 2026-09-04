"use client";

import Link from "next/link";
import { Award, Calendar, Target, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { IconChip } from "@/components/lisaan/icon-chip";
import { useOnboardingAnswers } from "@/lib/onboarding-store";

const PACE_LABEL: Record<string, string> = { "2": "2 days a week", "4": "4 days a week", "6": "6 days a week" };
const GOAL_LABEL: Record<string, string> = {
  work: "Work",
  exam: "IELTS / TOEFL",
  university: "University",
  travel: "Travel",
  general: "General fluency",
};

export default function OnboardingReadyPage() {
  const answers = useOnboardingAnswers();

  const summary = [
    {
      icon: TrendingUp,
      label: "Level",
      value:
        answers.level === "unsure" ? "We’ll confirm after your first quiz" : answers.level,
    },
    { icon: Target, label: "Goals", value: answers.goals?.map((g) => GOAL_LABEL[g] ?? g).join(", ") || "—" },
    { icon: Calendar, label: "Pace", value: answers.pace ? PACE_LABEL[answers.pace] : "—" },
    { icon: Award, label: "Plan", value: answers.plan === "annual" ? "Annual" : "Monthly" },
  ];

  return (
    <div className="flex flex-col items-center gap-8 text-center">
      <IconChip icon={Award} tone="achievement" size="lg" />
      <div className="flex flex-col gap-2">
        <h1 className="t-h2 text-fg-primary">You&rsquo;re all set</h1>
        <p className="t-body-sm max-w-sm text-fg-secondary">
          Every choice below is editable later from account settings.
        </p>
      </div>

      <dl className="grid w-full gap-3 sm:grid-cols-2">
        {summary.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-3 rounded-xl border border-stroke-default bg-bg-surface p-4 text-start"
          >
            <IconChip icon={item.icon} tone="brand" size="sm" />
            <div className="min-w-0">
              <dt className="t-body-xs text-fg-tertiary">{item.label}</dt>
              <dd className="t-body-sm-strong truncate text-fg-primary">{item.value}</dd>
            </div>
          </div>
        ))}
      </dl>

      <Button asChild size="lg" className="w-full">
        <Link href="/dashboard">Start learning</Link>
      </Button>
    </div>
  );
}
