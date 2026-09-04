"use client";

import * as React from "react";
import Link from "next/link";
import { Clock, Lock, Settings, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { IconChip } from "@/components/lisaan/icon-chip";

/** Start and end time in the reader's own timezone. */
function MaintenanceState({ startsAt, endsAt }: { startsAt: Date; endsAt: Date }) {
  const fmt = (d: Date) =>
    new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    }).format(d);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <IconChip icon={Settings} tone="brand" size="lg" />
      <div className="flex flex-col gap-2">
        <p className="t-h2 text-fg-primary">Down for scheduled maintenance</p>
        <p className="t-body-sm max-w-sm text-fg-tertiary">
          We're making some improvements. Back between {fmt(startsAt)} and {fmt(endsAt)}.
        </p>
      </div>
    </div>
  );
}

/** States which role is needed, not a bare refusal. */
function PermissionDeniedState({ roleNeeded }: { roleNeeded: string }) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <IconChip icon={Lock} tone="warning" size="lg" />
      <div className="flex flex-col gap-2">
        <p className="t-h2 text-fg-primary">You don't have access to this page</p>
        <p className="t-body-sm max-w-sm text-fg-tertiary">
          This page requires the {roleNeeded} role. Sign in with an account that has it, or ask an
          owner to grant access.
        </p>
      </div>
      <Button asChild variant="secondary">
        <Link href="/dashboard">Back to dashboard</Link>
      </Button>
    </div>
  );
}

/** How long until it clears. */
function RateLimitedState({ seconds = 30 }: { seconds?: number }) {
  const [remaining, setRemaining] = React.useState(seconds);

  React.useEffect(() => {
    if (remaining <= 0) return;
    const timer = setTimeout(() => setRemaining((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [remaining]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <IconChip icon={Clock} tone="warning" size="lg" />
      <div className="flex flex-col gap-2">
        <p className="t-h2 text-fg-primary">Too many requests</p>
        <p className="t-body-sm max-w-sm text-fg-tertiary">
          {remaining > 0 ? `You can try again in ${remaining}s.` : "You can try again now."}
        </p>
      </div>
    </div>
  );
}

/** Draft work preserved where it exists; sign in again returns to the same place. */
function SessionExpiredState({ next }: { next?: string }) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <IconChip icon={User} tone="neutral" size="lg" />
      <div className="flex flex-col gap-2">
        <p className="t-h2 text-fg-primary">Your session expired</p>
        <p className="t-body-sm max-w-sm text-fg-tertiary">
          Anything you were writing is still saved as a draft. Sign in again and you'll land right
          back here.
        </p>
      </div>
      <Button asChild>
        <Link href={`/sign-in${next ? `?next=${encodeURIComponent(next)}` : ""}`}>Sign in again</Link>
      </Button>
    </div>
  );
}

export { MaintenanceState, PermissionDeniedState, RateLimitedState, SessionExpiredState };
