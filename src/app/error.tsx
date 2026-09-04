"use client";

import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { IconChip } from "@/components/lisaan/icon-chip";

/** Blames our side, states nothing was lost, gives a reference code for support. */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const reference = error.digest ?? Math.random().toString(36).slice(2, 10).toUpperCase();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg-canvas p-8 text-center">
      <IconChip icon={AlertTriangle} tone="danger" size="lg" />
      <div className="flex flex-col gap-2">
        <p className="t-h2 text-fg-primary">Something went wrong on our side</p>
        <p className="t-body-sm max-w-sm text-fg-tertiary">
          This wasn't caused by anything you did, and nothing you'd entered was lost. Try again —
          if it keeps happening, send us the reference below.
        </p>
      </div>
      <p className="t-numeric-sm rounded-md bg-bg-subtle px-3 py-1.5 text-fg-secondary">
        Ref: {reference}
      </p>
      <Button onClick={() => reset()}>Try again</Button>
    </div>
  );
}
