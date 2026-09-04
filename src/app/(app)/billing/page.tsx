import { CreditCard } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconChip } from "@/components/lisaan/icon-chip";
import { DEMO_PLANS } from "@/lib/demo-data";

export default function BillingPage() {
  const plan = DEMO_PLANS.find((p) => p.id === "annual")!;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="t-h2 text-fg-primary">Billing</h1>
      <div className="flex items-center gap-4 rounded-2xl border border-stroke-default bg-bg-surface p-6">
        <IconChip icon={CreditCard} tone="brand" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="t-h5 text-fg-primary">{plan.label} plan</p>
            <Badge tone="success">Active</Badge>
          </div>
          <p className="t-body-sm text-fg-tertiary">
            ${plan.price} {plan.cadence} · renews automatically
          </p>
        </div>
        <Button variant="secondary">Manage plan</Button>
      </div>
    </div>
  );
}
