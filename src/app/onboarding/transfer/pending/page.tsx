import Link from "next/link";
import { Check, Clock, FileCheck } from "lucide-react";

import { Button } from "@/components/ui/button";

const STEPS = [
  { icon: Check, title: "Transfer sent", body: "You marked your transfer as sent.", done: true },
  { icon: FileCheck, title: "Receipt received", body: "We have your receipt and reference.", done: true },
  { icon: Clock, title: "Awaiting confirmation", body: "The instructor matches it against the bank statement, usually within one business day.", done: false },
];

export default function TransferPendingPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="t-h2 text-fg-primary">Your transfer is on its way</h1>
        <p className="t-body-sm text-fg-secondary">
          Your free lessons are already open — start now while we confirm your payment.
        </p>
      </div>

      <ol className="flex flex-col gap-4">
        {STEPS.map((step) => (
          <li key={step.title} className="flex items-start gap-3">
            <span
              className={
                step.done
                  ? "flex size-8 shrink-0 items-center justify-center rounded-full bg-bg-brand text-fg-on-brand"
                  : "flex size-8 shrink-0 items-center justify-center rounded-full border border-stroke-default text-fg-tertiary"
              }
            >
              <step.icon className="size-4" aria-hidden />
            </span>
            <div>
              <p className="t-label-md text-fg-primary">{step.title}</p>
              <p className="t-body-sm text-fg-tertiary">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <Button asChild className="w-full">
        <Link href="/dashboard">Go to my dashboard</Link>
      </Button>
    </div>
  );
}
