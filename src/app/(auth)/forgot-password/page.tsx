"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Field } from "@/components/lisaan/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const schema = z.object({ email: z.string().email("Enter a valid email address.") });
type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: "" } });

  async function onSubmit() {
    await new Promise((resolve) => setTimeout(resolve, 400));
    // Always the same destination, whether or not the address exists.
    router.push("/forgot-password/sent");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="t-h2 text-fg-primary">Forgot your password?</h1>
        <p className="t-body-sm text-fg-secondary">
          Enter the email on your account and we&rsquo;ll send a reset link.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <Field label="Email" error={form.formState.errors.email?.message}>
          <Input type="email" autoComplete="email" {...form.register("email")} />
        </Field>
        <Button type="submit" loading={form.formState.isSubmitting}>
          Send reset link
        </Button>
      </form>

      <p className="t-body-sm text-center text-fg-tertiary">
        <Link href="/sign-in" className="text-fg-link hover:text-fg-link-hover">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
