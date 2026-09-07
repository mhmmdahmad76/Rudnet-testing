"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { CodeInput } from "@/components/lisaan/code-input";
import { Field } from "@/components/lisaan/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { verifyRecoveryCode, verifyTwoFactorCode } from "../actions";

export function TwoFactorForm() {
  const router = useRouter();
  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState(false);
  const [attemptsLeft, setAttemptsLeft] = React.useState(3);
  const [useRecovery, setUseRecovery] = React.useState(false);
  const [recoveryCode, setRecoveryCode] = React.useState("");
  const [recoveryError, setRecoveryError] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  async function handleComplete(value: string) {
    setPending(true);
    const result = await verifyTwoFactorCode(value);
    setPending(false);

    if (result.ok) {
      router.push("/admin");
      router.refresh();
      return;
    }
    if (result.kind === "locked") {
      router.push("/admin/locked");
      return;
    }
    setError(true);
    setCode("");
    setAttemptsLeft(result.attemptsLeft ?? 0);
  }

  async function submitRecovery(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    const result = await verifyRecoveryCode(recoveryCode);
    setPending(false);

    if (result.ok) {
      router.push("/admin");
      router.refresh();
      return;
    }
    setRecoveryError(true);
  }

  if (useRecovery) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="t-h2 text-fg-primary">Enter a recovery code</h1>
          <p className="t-body-sm text-fg-secondary">10 characters, letters and numbers. Each code works once.</p>
        </div>
        <form onSubmit={submitRecovery} className="flex flex-col gap-4">
          <Field
            label="Recovery code"
            error={recoveryError ? "That code has already been used or doesn't match." : undefined}
          >
            <Input
              value={recoveryCode}
              onChange={(event) => setRecoveryCode(event.target.value)}
              placeholder="XXXXX-XXXXX"
              className="t-numeric-md"
            />
          </Field>
          <Button type="submit" loading={pending}>
            Verify
          </Button>
        </form>
        <button
          type="button"
          onClick={() => setUseRecovery(false)}
          className="t-label-sm text-fg-link hover:text-fg-link-hover"
        >
          Use your authenticator app instead
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="flex flex-col gap-2">
        <h1 className="t-h2 text-fg-primary">Two-factor authentication</h1>
        <p className="t-body-sm text-fg-secondary">Enter the 6-digit code from your authenticator app.</p>
      </div>

      <CodeInput length={6} value={code} onChange={setCode} onComplete={handleComplete} error={error} disabled={pending} />

      {error && (
        <p className="t-body-sm text-fg-danger">
          That code didn&rsquo;t match — {attemptsLeft} attempt{attemptsLeft === 1 ? "" : "s"} left before
          this account is locked for 15 minutes.
        </p>
      )}

      <button
        type="button"
        onClick={() => setUseRecovery(true)}
        className="t-label-sm text-fg-link hover:text-fg-link-hover"
      >
        Use a recovery code instead
      </button>
    </div>
  );
}
