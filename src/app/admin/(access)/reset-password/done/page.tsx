import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { IconChip } from "@/components/lisaan/icon-chip";
import { Button } from "@/components/ui/button";

export default function AdminResetPasswordDonePage() {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <IconChip icon={CheckCircle2} tone="success" size="lg" />
      <div className="flex flex-col gap-2">
        <h1 className="t-h2 text-fg-primary">Password changed</h1>
        <p className="t-body-sm max-w-sm text-fg-secondary">
          For your security, every other session was signed out. Your authenticator app still
          works as before — sign in with your new password, then verify the 6-digit code.
        </p>
      </div>
      <Button asChild>
        <Link href="/admin/sign-in">Sign in</Link>
      </Button>
    </div>
  );
}
