"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Field } from "@/components/lisaan/field";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import {
  EMAIL_COOKIE,
  NAME_COOKIE,
  ONBOARDING_STEP_COOKIE,
  SESSION_COOKIE,
  VERIFIED_COOKIE,
  setDemoCookie,
} from "@/lib/session";

const schema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
  remember: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

/**
 * There's no backend, so specific inputs stand in for the account states
 * this screen has to handle: "locked@example.com" → locked out,
 * "suspended@example.com" → suspended, any other email with a password
 * that isn't "demo1234" → wrong password (three attempts, then locked).
 */
type ScreenState = { kind: "form" } | { kind: "locked"; seconds: number } | { kind: "suspended" };

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";

  const [screen, setScreen] = React.useState<ScreenState>({ kind: "form" });
  const [attemptsLeft, setAttemptsLeft] = React.useState(3);
  const [wrongPassword, setWrongPassword] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", remember: false },
  });

  React.useEffect(() => {
    if (screen.kind !== "locked" || screen.seconds <= 0) return;
    const timer = setTimeout(() => {
      setScreen((current) =>
        current.kind === "locked" ? { kind: "locked", seconds: current.seconds - 1 } : current,
      );
    }, 1000);
    return () => clearTimeout(timer);
  }, [screen]);

  async function onSubmit(values: FormValues) {
    setWrongPassword(false);
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (values.email === "suspended@example.com") {
      setScreen({ kind: "suspended" });
      return;
    }
    if (values.email === "locked@example.com") {
      setScreen({ kind: "locked", seconds: 30 });
      return;
    }
    if (values.email === "manydevices@example.com") {
      setDemoCookie(SESSION_COOKIE, "1");
      setDemoCookie(VERIFIED_COOKIE, "1");
      setDemoCookie(NAME_COOKIE, "Student");
      setDemoCookie(EMAIL_COOKIE, values.email);
      router.push(`/devices?next=${encodeURIComponent(next)}`);
      return;
    }
    if (values.password !== "demo1234") {
      const remaining = attemptsLeft - 1;
      setAttemptsLeft(remaining);
      setWrongPassword(true);
      if (remaining <= 0) {
        setScreen({ kind: "locked", seconds: 30 });
      }
      return;
    }

    setDemoCookie(SESSION_COOKIE, "1", values.remember ? 30 : 1);
    setDemoCookie(VERIFIED_COOKIE, "1");
    setDemoCookie(NAME_COOKIE, values.email.split("@")[0]!.replace(/\W+/g, " ") || "Student");
    setDemoCookie(EMAIL_COOKIE, values.email);
    setDemoCookie(ONBOARDING_STEP_COOKIE, "done");
    router.push(next);
    router.refresh();
  }

  if (screen.kind === "locked") {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="t-h2 text-fg-primary">Too many attempts</h1>
          <p className="t-body-sm text-fg-secondary">
            For your security, sign-in is paused for this account.
          </p>
        </div>
        <Alert
          tone="danger"
          title="Try again shortly"
          body={`You can try again in ${screen.seconds}s, or reset your password now.`}
        />
        <Button asChild variant="secondary">
          <Link href="/forgot-password">Reset your password</Link>
        </Button>
      </div>
    );
  }

  if (screen.kind === "suspended") {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="t-h2 text-fg-primary">Sign in</h1>
        </div>
        <Alert
          tone="danger"
          title="This account has been suspended"
          body="Contact support if you believe this is a mistake."
        />
        <Button asChild variant="secondary">
          <Link href="mailto:support@lisaan.app">Contact support</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="t-h2 text-fg-primary">Welcome back</h1>
        <p className="t-body-sm text-fg-secondary">Sign in to keep learning where you left off.</p>
      </div>

      {wrongPassword && (
        <Alert
          tone="danger"
          title="That password doesn't match"
          body={`${attemptsLeft} attempt${attemptsLeft === 1 ? "" : "s"} remaining before your account is paused.`}
        />
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <Field label="Email" error={form.formState.errors.email?.message} invalid={wrongPassword}>
          <Input
            type="email"
            autoComplete="email"
            {...form.register("email")}
          />
        </Field>
        <Field
          label="Password"
          error={form.formState.errors.password?.message}
          invalid={wrongPassword}
        >
          <Input type="password" autoComplete="current-password" {...form.register("password")} />
        </Field>

        <div className="flex items-center justify-between">
          <Checkbox
            checked={form.watch("remember")}
            onCheckedChange={(checked) => form.setValue("remember", checked === true)}
            label="Remember this device"
          />
          <Link href="/forgot-password" className="t-label-sm text-fg-link hover:text-fg-link-hover">
            Reset password
          </Link>
        </div>

        <Button type="submit" loading={form.formState.isSubmitting} className="mt-2">
          Sign in
        </Button>
      </form>

      <p className="t-body-sm text-center text-fg-tertiary">
        New to Lisaan?{" "}
        <Link href="/sign-up" className="text-fg-link hover:text-fg-link-hover">
          Create one
        </Link>
      </p>
    </div>
  );
}
