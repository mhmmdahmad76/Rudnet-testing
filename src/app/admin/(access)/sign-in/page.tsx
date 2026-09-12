"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Field } from "@/components/lisaan/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { adminSignIn } from "../actions";

const schema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});
type FormValues = z.infer<typeof schema>;

// Bootstrap credential (seeded by the init_auth migration): admin@lisaan.app / admin1234
export default function AdminSignInPage() {
  const router = useRouter();
  const [rejected, setRejected] = React.useState(false);
  const [attemptsLeft, setAttemptsLeft] = React.useState(3);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: FormValues) {
    setRejected(false);
    const result = await adminSignIn(values);

    if (!result.ok) {
      if (result.kind === "locked") {
        router.push("/admin/locked");
        return;
      }
      setAttemptsLeft(result.attemptsLeft ?? Math.max(0, attemptsLeft - 1));
      setRejected(true);
      return;
    }

    router.push(result.needsSetup ? "/admin/2fa/setup" : "/admin/2fa");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="t-h2 text-fg-primary">Admin sign in</h1>
        <p className="t-body-sm text-fg-secondary">
          This is a separate credential from any student account.
        </p>
      </div>

      {rejected && (
        <Alert
          tone="danger"
          title="Email or password doesn't match an admin account"
          body={`${attemptsLeft} attempt${attemptsLeft === 1 ? "" : "s"} remaining. This is not your student sign-in.`}
        />
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <Field label="Email" error={form.formState.errors.email?.message} invalid={rejected}>
          <Input type="email" autoComplete="email" {...form.register("email")} />
        </Field>
        <Field label="Password" error={form.formState.errors.password?.message} invalid={rejected}>
          <Input type="password" autoComplete="current-password" {...form.register("password")} />
        </Field>
        <Button type="submit" loading={form.formState.isSubmitting} className="mt-2">
          Sign in
        </Button>
      </form>

      <p className="t-body-sm text-center">
        <Link href="/admin/forgot-password" className="text-fg-link hover:text-fg-link-hover">
          Forgot your password?
        </Link>
      </p>

      <p className="t-body-xs text-center text-fg-tertiary">
        Every sign-in, price change, and entitlement grant is written to the audit log.
      </p>
    </div>
  );
}
