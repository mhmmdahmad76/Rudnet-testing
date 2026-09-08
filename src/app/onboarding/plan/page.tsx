"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { RadioGroup } from "@/components/ui/radio-group";
import { ChoiceCard } from "@/components/lisaan/choice-card";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/lisaan/field";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
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
  const [showCardForm, setShowCardForm] = React.useState(false);
  const [cardNumber, setCardNumber] = React.useState("");
  const [processing, setProcessing] = React.useState(false);
  const [declined, setDeclined] = React.useState(false);
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

  async function payByCard(event: React.FormEvent) {
    event.preventDefault();
    setDeclined(false);
    setProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 900));

    // Test card 4000000000000002 simulates a decline, like Stripe's test suite.
    if (cardNumber.replace(/\s+/g, "") === "4000000000000002") {
      setProcessing(false);
      setDeclined(true);
      return;
    }

    setOnboardingAnswers({ paymentMethod: "card" });
    await setPlanStatus("premium", planId);
    await setOnboardingStep("done");
    router.push("/onboarding/ready");
  }

  async function skipPayment() {
    setSkipping(true);
    await setPlanStatus("free");
    await setOnboardingStep("done");
    router.push("/onboarding/ready");
  }

  const pending = processing || transferPending || skipping;

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

      {declined && (
        <Alert
          className="mt-6"
          tone="danger"
          title="Your card was declined"
          body="Your issuer declined this charge (insufficient funds). Your card is kept on file — try another card, or pay by bank transfer instead."
        />
      )}

      {!showCardForm ? (
        <div className="mt-8 flex flex-col gap-3">
          <Button onClick={() => setShowCardForm(true)} disabled={pending}>
            Pay by card
          </Button>
          <Button variant="secondary" loading={transferPending} disabled={pending} onClick={payByTransfer}>
            Pay by bank transfer
          </Button>
        </div>
      ) : (
        <form onSubmit={payByCard} className="mt-8 flex flex-col gap-4">
          <Field label="Card number" help="Demo only — try 4000 0000 0000 0002 to see a decline.">
            <Input
              inputMode="numeric"
              placeholder="4242 4242 4242 4242"
              value={cardNumber}
              onChange={(event) => setCardNumber(event.target.value)}
              disabled={pending}
              required
            />
          </Field>
          <Button type="submit" loading={processing} disabled={pending && !processing}>
            Pay ${total.toFixed(2)}
          </Button>
          <Button type="button" variant="ghost" disabled={pending} onClick={payByTransfer}>
            Pay by bank transfer instead
          </Button>
        </form>
      )}

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
