"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Field } from "@/components/lisaan/field";
import { PasswordChecklist } from "@/components/lisaan/password-checklist";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EMAIL_COOKIE, NAME_COOKIE, SESSION_COOKIE, setDemoCookie } from "@/lib/session";

const COUNTRIES = [
  { value: "ae", label: "United Arab Emirates" },
  { value: "sa", label: "Saudi Arabia" },
  { value: "kw", label: "Kuwait" },
  { value: "qa", label: "Qatar" },
  { value: "bh", label: "Bahrain" },
  { value: "om", label: "Oman" },
];

const schema = z.object({
  name: z.string().min(1, "Enter your name."),
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "At least 8 characters."),
  country: z.string().min(1, "Choose your country."),
  terms: z
    .boolean()
    .refine((value) => value === true, "You must confirm you're 18 or older to continue."),
});

type FormValues = z.infer<typeof schema>;

export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan");

  const [emailTaken, setEmailTaken] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "", country: "", terms: false },
  });

  const password = form.watch("password");

  async function onSubmit(values: FormValues) {
    setEmailTaken(false);
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (values.email === "taken@example.com") {
      setEmailTaken(true);
      return;
    }

    setDemoCookie(SESSION_COOKIE, "1");
    setDemoCookie(NAME_COOKIE, values.name);
    setDemoCookie(EMAIL_COOKIE, values.email);
    router.push("/verify-email");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="t-h2 text-fg-primary">Create your account</h1>
        {plan && <p className="t-body-sm text-fg-secondary">Signing up for the {plan} plan.</p>}
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <Field label="Full name" error={form.formState.errors.name?.message}>
          <Input autoComplete="name" {...form.register("name")} />
        </Field>

        <Field
          label="Email"
          error={
            emailTaken
              ? "That address already has an account — sign in instead."
              : form.formState.errors.email?.message
          }
        >
          <Input type="email" autoComplete="email" {...form.register("email")} />
        </Field>
        {emailTaken && (
          <Link href="/sign-in" className="t-label-sm -mt-2 text-fg-link hover:text-fg-link-hover">
            Go to sign in →
          </Link>
        )}

        <Field label="Password" error={form.formState.errors.password?.message}>
          <Input type="password" autoComplete="new-password" {...form.register("password")} />
        </Field>
        <PasswordChecklist password={password} />

        <Field label="Country" error={form.formState.errors.country?.message}>
          <Select onValueChange={(value) => form.setValue("country", value, { shouldValidate: true })}>
            <SelectTrigger>
              <SelectValue placeholder="Choose your country" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((country) => (
                <SelectItem key={country.value} value={country.value}>
                  {country.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Checkbox
          checked={form.watch("terms") === true}
          onCheckedChange={(checked) => form.setValue("terms", checked === true, { shouldValidate: true })}
          label="I'm 18 or older and I agree to the Terms and Privacy Policy"
        />
        {form.formState.errors.terms && (
          <p className="t-body-sm -mt-2 text-fg-danger">{form.formState.errors.terms.message}</p>
        )}

        <Button type="submit" loading={form.formState.isSubmitting} className="mt-2">
          Create account
        </Button>
      </form>

      <p className="t-body-sm text-center text-fg-tertiary">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-fg-link hover:text-fg-link-hover">
          Sign in
        </Link>
      </p>
    </div>
  );
}
