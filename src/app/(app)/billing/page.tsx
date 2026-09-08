import Link from "next/link";
import { CreditCard } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconChip } from "@/components/lisaan/icon-chip";
import { verifyStudentSession } from "@/lib/dal";
import { DEMO_PLANS } from "@/lib/demo-data";

export default async function BillingPage() {
  const session = await verifyStudentSession();
  const plan = session.planId ? DEMO_PLANS.find((p) => p.id === session.planId) : null;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="t-h2 text-fg-primary">Billing</h1>
      <div className="flex items-center gap-4 rounded-2xl border border-stroke-default bg-bg-surface p-6">
        <IconChip icon={CreditCard} tone="brand" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="t-h5 text-fg-primary">{plan ? `${plan.label} plan` : "Free plan"}</p>
            <Badge tone={session.planStatus === "premium" ? "success" : "neutral"}>
              {session.planStatus === "premium" ? "Active" : "Free"}
            </Badge>
          </div>
          <p className="t-body-sm text-fg-tertiary">
            {plan
              ? `$${plan.price} ${plan.cadence} · renews automatically`
              : "Unlock every lesson and quiz by upgrading."}
          </p>
        </div>
        <Button asChild variant="secondary">
          <Link href="/onboarding/plan">{plan ? "Manage plan" : "Upgrade"}</Link>
        </Button>
      </div>
    </div>
  );
}
