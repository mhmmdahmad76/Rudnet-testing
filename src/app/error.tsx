"use client";

import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { IconChip } from "@/components/lisaan/icon-chip";

/** Deterministic, not random — the same error must hash to the same
 * reference on the server render and the client's hydration render, or
 * they'd mismatch. A real backend's error digest would replace this. */
function hashReference(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36).toUpperCase().padStart(8, "0").slice(0, 8);
}

/** Blames our side, states nothing was lost, gives a reference code for support. */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const reference = error.digest ?? hashReference(error.message + (error.stack ?? ""));

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg-canvas p-8 text-center">
      <IconChip icon={AlertTriangle} tone="danger" size="lg" />
      <div className="flex flex-col gap-2">
        <p className="t-h2 text-fg-primary">Something went wrong on our side</p>
        <p className="t-body-sm max-w-sm text-fg-tertiary">
          This wasn&rsquo;t caused by anything you did, and nothing you&rsquo;d entered was lost.
          Try again — if it keeps happening, send us the reference below.
        </p>
      </div>
      <p className="t-numeric-sm rounded-md bg-bg-subtle px-3 py-1.5 text-fg-secondary">
        Ref: {reference}
      </p>
      <Button onClick={() => reset()}>Try again</Button>
    </div>
  );
}
