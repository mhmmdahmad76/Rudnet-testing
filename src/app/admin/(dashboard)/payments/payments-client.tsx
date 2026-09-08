"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CreditCard, Paperclip } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/lisaan/empty-state";
import type { PaymentRequestRow } from "@/lib/admin-students";
import { resolvePaymentRequestAction } from "../actions";

export function PaymentsClient({ requests }: { requests: PaymentRequestRow[] }) {
  const router = useRouter();
  const [resolvingId, setResolvingId] = React.useState<number | null>(null);

  async function resolve(id: number, decision: "approved" | "rejected") {
    setResolvingId(id);
    const result = await resolvePaymentRequestAction(id, decision);
    setResolvingId(null);
    if (result.ok) {
      toast.success(decision === "approved" ? "Approved — student is now premium" : "Rejected");
      router.refresh();
    } else {
      toast.error("That request was already resolved");
      router.refresh();
    }
  }

  if (requests.length === 0) {
    return (
      <div className="rounded-2xl border border-stroke-default bg-bg-surface">
        <EmptyState icon={CreditCard} title="Nothing waiting" body="No bank transfers need your review right now." />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="t-h2 text-fg-primary">Payments</h1>
      <div className="flex flex-col gap-2">
        {requests.map((request) => (
          <div
            key={request.id}
            className="flex items-center justify-between rounded-xl border border-stroke-default bg-bg-surface p-4"
          >
            <div>
              <Link href={`/admin/students/${request.studentId}`} className="t-body-sm-strong text-fg-primary hover:underline">
                {request.studentName}
              </Link>
              <p className="t-body-xs text-fg-tertiary">
                {request.studentEmail} · {request.planId} · {request.currency} {request.amount.toFixed(2)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone="warning">Awaiting review</Badge>
              {request.receiptKey && (
                <Button size="sm" variant="ghost" icon={<Paperclip />} asChild>
                  <a href={`/admin/api/receipts/${request.id}`} target="_blank" rel="noreferrer">
                    {request.receiptFilename ?? "Receipt"}
                  </a>
                </Button>
              )}
              <Button
                size="sm"
                variant="secondary"
                disabled={resolvingId === request.id}
                onClick={() => resolve(request.id, "rejected")}
              >
                Reject
              </Button>
              <Button size="sm" loading={resolvingId === request.id} onClick={() => resolve(request.id, "approved")}>
                Approve
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
