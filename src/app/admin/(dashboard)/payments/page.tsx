"use client";

import { useSearchParams } from "next/navigation";
import { CreditCard } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/lisaan/empty-state";
import { DEMO_STUDENTS } from "@/lib/demo-data";

export default function AdminPaymentsPage() {
  const state = useSearchParams().get("state");
  const pending = DEMO_STUDENTS.filter((s) => s.paymentState === "retrying" || s.paymentState === "failed");
  const rows = state === "pending" ? pending : DEMO_STUDENTS.filter((s) => s.paymentMethod);

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-stroke-default bg-bg-surface">
        <EmptyState icon={CreditCard} title="Nothing waiting" body="No payments need your attention right now." />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="t-h2 text-fg-primary">Payments</h1>
      <div className="flex flex-col gap-2">
        {rows.map((student) => (
          <div
            key={student.id}
            className="flex items-center justify-between rounded-xl border border-stroke-default bg-bg-surface p-4"
          >
            <div>
              <p className="t-body-sm-strong text-fg-primary">{student.name}</p>
              <p className="t-body-xs text-fg-tertiary">
                {student.paymentMethod} · {student.paymentState}
              </p>
            </div>
            <Badge tone={student.paymentState === "failed" ? "danger" : "warning"}>
              {student.paymentState}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
