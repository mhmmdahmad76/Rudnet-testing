"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Field } from "@/components/lisaan/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PasswordChecklist } from "@/components/lisaan/password-checklist";

const schema = z
  .object({
    password: z.string().min(8, "At least 8 characters."),
    confirm: z.string().min(1, "Confirm your new password."),
  })
  .refine((values) => values.password === values.confirm, {
    error: "Passwords don't match.",
    path: ["confirm"],
  });

type FormValues = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirm: "" },
  });

  React.useEffect(() => {
    if (!token || token === "expired") {
      router.replace("/reset-password/expired");
    }
  }, [token, router]);

  const password = form.watch("password");

  async function onSubmit() {
    await new Promise((resolve) => setTimeout(resolve, 500));
    router.push("/reset-password/done");
  }

  if (!token || token === "expired") return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="t-h2 text-fg-primary">Choose a new password</h1>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <Field label="New password" error={form.formState.errors.password?.message}>
          <Input type="password" autoComplete="new-password" {...form.register("password")} />
        </Field>
        <PasswordChecklist password={password} />

        <Field label="Confirm password" error={form.formState.errors.confirm?.message}>
          <Input type="password" autoComplete="new-password" {...form.register("confirm")} />
        </Field>

        <Button type="submit" loading={form.formState.isSubmitting}>
          Reset password
        </Button>
      </form>
    </div>
  );
}
