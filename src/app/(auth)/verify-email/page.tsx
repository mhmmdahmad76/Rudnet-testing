"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { CodeInput } from "@/components/lisaan/code-input";
import { Button } from "@/components/ui/button";
import { EMAIL_COOKIE, ONBOARDING_STEP_COOKIE, VERIFIED_COOKIE, setDemoCookie } from "@/lib/session";
import { useCookie } from "@/lib/use-cookie";

const CORRECT_CODE = "123456";
const RESEND_SECONDS = 60;

export default function VerifyEmailPage() {
  const router = useRouter();
  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState(false);
  const [attemptsLeft, setAttemptsLeft] = React.useState(5);
  const [resendIn, setResendIn] = React.useState(RESEND_SECONDS);
  const email = useCookie(EMAIL_COOKIE);

  React.useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  function handleComplete(value: string) {
    if (value === CORRECT_CODE) {
      setDemoCookie(VERIFIED_COOKIE, "1");
      setDemoCookie(ONBOARDING_STEP_COOKIE, "level");
      router.push("/onboarding/level");
      router.refresh();
      return;
    }
    setError(true);
    setAttemptsLeft((n) => Math.max(0, n - 1));
    setCode("");
  }

  function handleResend() {
    setResendIn(RESEND_SECONDS);
    setError(false);
    setAttemptsLeft(5);
  }

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="flex flex-col gap-2">
        <h1 className="t-h2 text-fg-primary">Check your inbox</h1>
        <p className="t-body-sm text-fg-secondary">
          We sent a 6-digit code to {email ? <strong className="text-fg-primary">{email}</strong> : "your email"}.
        </p>
      </div>

      <CodeInput length={6} value={code} onChange={setCode} onComplete={handleComplete} error={error} />

      {error && (
        <p className="t-body-sm text-fg-danger">
          That code didn&rsquo;t match. Codes expire after 30 seconds — {attemptsLeft} attempt
          {attemptsLeft === 1 ? "" : "s"} left. (Demo code: 123456)
        </p>
      )}

      <Button
        variant="ghost"
        size="sm"
        disabled={resendIn > 0}
        onClick={handleResend}
      >
        {resendIn > 0 ? `Resend code in ${resendIn}s` : "Resend code"}
      </Button>

      <Link href="/sign-up" className="t-label-sm text-fg-link hover:text-fg-link-hover">
        Use a different address
      </Link>
    </div>
  );
}
