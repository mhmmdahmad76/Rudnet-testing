"use client";

import * as React from "react";

import { Alert } from "@/components/ui/alert";

export function LockedCountdown({ initialSeconds }: { initialSeconds: number }) {
  const [seconds, setSeconds] = React.useState(initialSeconds);

  React.useEffect(() => {
    if (seconds <= 0) return;
    const timer = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="flex flex-col gap-2">
        <h1 className="t-h2 text-fg-primary">This account is locked</h1>
        <p className="t-body-sm text-fg-secondary">
          Too many failed attempts. For security, sign-in is paused for a while.
        </p>
      </div>

      <p className="t-numeric-lg text-fg-primary">
        {seconds > 0 ? `${minutes}:${secs}` : "You can try again now"}
      </p>

      <Alert
        tone="info"
        title="Wasn't you?"
        body="If you didn't try to sign in, your credentials may be compromised — change your password once you're back in, and check the audit log for anything unfamiliar."
      />
    </div>
  );
}
