"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { RadioGroup } from "@/components/ui/radio-group";
import { ChoiceCard } from "@/components/lisaan/choice-card";
import { Button } from "@/components/ui/button";
import { OnboardingStepBar } from "@/components/lisaan/onboarding-step-bar";
import { DEMO_PLANS } from "@/lib/demo-data";
import { getOnboardingAnswers, setOnboardingAnswers } from "@/lib/onboarding-store";
import { setOnboardingStep, setPlanStatus } from "@/app/(auth)/actions";

const VAT_PCT = 5;

export default function OnboardingPlanPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [planId, setPlanId] = React.useState<"monthly" | "annual">(
    () => (searchParams.get("plan") as "monthly" | "annual") ?? getOnboardingAnswers().plan ?? "annual",
  );
  const [transferPending, setTransferPending] = React.useState(false);
  const [skipping, setSkipping] = React.useState(false);

  const plan = DEMO_PLANS.find((p) => p.id === planId)!;
  const vat = Math.round(plan.price * (VAT_PCT / 100) * 100) / 100;
  const total = plan.price + vat;

  function choosePlan(value: string) {
    setPlanId(value as "monthly" | "annual");
    setOnboardingAnswers({ plan: value as "monthly" | "annual" });
  }

  async function payByTransfer() {
    setTransferPending(true);
    setOnboardingAnswers({ paymentMethod: "transfer" });
    await setOnboardingStep("plan");
    router.push("/onboarding/transfer");
  }

  async function skipPayment() {
    setSkipping(true);
    await setPlanStatus("free");
    await setOnboardingStep("done");
    router.push("/onboarding/ready");
  }

  const pending = transferPending || skipping;

  return (
    <div>
      <OnboardingStepBar step={4} loading={pending} />
      <h1 className="t-h2 mb-2 text-fg-primary">Choose your plan</h1>
      <p className="t-body-sm mb-6 text-fg-secondary">Cancel any time from account settings.</p>

      <RadioGroup value={planId} onValueChange={choosePlan} className="gap-3">
        {DEMO_PLANS.map((option) => (
          <ChoiceCard
            key={option.id}
            value={option.id}
            marker={option.id === "annual" ? "1yr" : "1mo"}
            title={`${option.label}${option.badge ? ` — ${option.badge}` : ""}`}
            description={`$${option.price} ${option.cadence}`}
          />
        ))}
      </RadioGroup>

      <div className="mt-6 flex flex-col gap-2 rounded-xl border border-stroke-default bg-bg-surface p-4">
        <div className="flex items-center justify-between">
          <span className="t-body-sm text-fg-tertiary">{plan.label} plan</span>
          <span className="t-numeric-md text-fg-primary">${plan.price.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="t-body-sm text-fg-tertiary">VAT ({VAT_PCT}%)</span>
          <span className="t-numeric-md text-fg-primary">${vat.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between border-t border-stroke-subtle pt-2">
          <span className="t-label-md text-fg-primary">Total due today</span>
          <span className="t-numeric-lg text-fg-primary">${total.toFixed(2)}</span>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <Button loading={transferPending} disabled={pending} onClick={payByTransfer}>
          Pay by bank transfer
        </Button>
        <p className="t-body-xs text-center text-fg-tertiary">
          You&rsquo;ll get our bank details and upload your payment receipt on the next screen — an
          instructor confirms it manually, usually within a day.
        </p>
      </div>

      <div className="mt-4 text-center">
        <button
          type="button"
          disabled={pending}
          onClick={skipPayment}
          className="t-label-sm text-fg-link hover:text-fg-link-hover disabled:opacity-50"
        >
          Continue with the free plan instead
        </button>
        <p className="t-body-xs mt-1 text-fg-tertiary">
          Free access to preview lessons — upgrade any time from your dashboard.
        </p>
      </div>
    </div>
  );
}
