"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Field } from "@/components/lisaan/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { ADMIN_SESSION_COOKIE, setDemoCookie } from "@/lib/session";

const schema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});
type FormValues = z.infer<typeof schema>;

// Demo credential: admin@lisaan.app / admin1234
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
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (values.email !== "admin@lisaan.app" || values.password !== "admin1234") {
      setAttemptsLeft((n) => Math.max(0, n - 1));
      setRejected(true);
      return;
    }

    setDemoCookie(ADMIN_SESSION_COOKIE, "1");
    router.push("/admin/2fa");
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

      <p className="t-body-xs text-center text-fg-tertiary">
        Every sign-in, price change, and entitlement grant is written to the audit log.
      </p>
    </div>
  );
}
