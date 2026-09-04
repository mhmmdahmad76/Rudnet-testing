"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { Field } from "@/components/lisaan/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PasswordChecklist } from "@/components/lisaan/password-checklist";
import { ADMIN_SESSION_COOKIE, setDemoCookie } from "@/lib/session";

export default function AdminInvitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const invitedEmail = "owner@lisaan.app";

  const [password, setPassword] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  if (!token || token === "expired") {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="t-h2 text-fg-primary">This invitation has expired</h1>
        <p className="t-body-sm max-w-sm text-fg-secondary">
          Instructor invitations last 7 days and are bound to one address. Ask whoever sent it to
          send a new one.
        </p>
        <Button onClick={() => toast("A new invitation was requested")}>
          Request a new invitation
        </Button>
      </div>
    );
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setDemoCookie(ADMIN_SESSION_COOKIE, "1");
    router.push("/admin/2fa");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="t-h2 text-fg-primary">Set up your instructor account</h1>
        <p className="t-body-sm text-fg-secondary">
          Two-factor authentication is required for every admin account — it isn't a setting you
          can turn off.
        </p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Field label="Email">
          <Input value={invitedEmail} disabled readOnly />
        </Field>
        <Field label="Create a password">
          <Input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
          />
        </Field>
        <PasswordChecklist password={password} />
        <Button type="submit" loading={submitting} disabled={password.length < 8}>
          Continue to two-factor setup
        </Button>
      </form>
    </div>
  );
}
