"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { CodeInput } from "@/components/lisaan/code-input";
import { Button } from "@/components/ui/button";
import { resendVerificationCode, verifyEmailCode } from "../actions";

const RESEND_SECONDS = 60;

const ERROR_COPY: Record<string, string> = {
  expired: "That code has expired. Request a new one below.",
  "too-many": "Too many attempts — request a new code below.",
  mismatch: "That code didn't match.",
};

export function VerifyEmailForm({ email }: { email: string }) {
  const router = useRouter();
  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [attemptsLeft, setAttemptsLeft] = React.useState<number | null>(null);
  const [resendIn, setResendIn] = React.useState(RESEND_SECONDS);
  const [pending, setPending] = React.useState(false);

  React.useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  async function handleComplete(value: string) {
    setPending(true);
    const result = await verifyEmailCode(value);
    setPending(false);

    if (result.ok) {
      router.push("/onboarding/level");
      router.refresh();
      return;
    }

    setError(ERROR_COPY[result.error] ?? "That code didn't match.");
    setAttemptsLeft(result.error === "mismatch" ? result.attemptsLeft : null);
    setCode("");
  }

  async function handleResend() {
    const result = await resendVerificationCode();
    if (result.ok) {
      setResendIn(RESEND_SECONDS);
      setError(null);
      setAttemptsLeft(null);
    } else {
      setResendIn(result.retryInSeconds ?? RESEND_SECONDS);
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="flex flex-col gap-2">
        <h1 className="t-h2 text-fg-primary">Check your inbox</h1>
        <p className="t-body-sm text-fg-secondary">
          We sent a 6-digit code to <strong className="text-fg-primary">{email}</strong>.
        </p>
      </div>

      <CodeInput
        length={6}
        value={code}
        onChange={setCode}
        onComplete={handleComplete}
        error={Boolean(error)}
        disabled={pending}
      />

      {error && (
        <p className="t-body-sm text-fg-danger">
          {error}
          {attemptsLeft !== null && ` ${attemptsLeft} attempt${attemptsLeft === 1 ? "" : "s"} left.`}
        </p>
      )}

      <Button variant="ghost" size="sm" disabled={resendIn > 0} onClick={handleResend}>
        {resendIn > 0 ? `Resend code in ${resendIn}s` : "Resend code"}
      </Button>

      <Link href="/sign-up" className="t-label-sm text-fg-link hover:text-fg-link-hover">
        Use a different address
      </Link>
    </div>
  );
}
