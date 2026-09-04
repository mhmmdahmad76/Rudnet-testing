import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { IconChip } from "@/components/lisaan/icon-chip";
import { Button } from "@/components/ui/button";

export default function ResetPasswordDonePage() {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <IconChip icon={CheckCircle2} tone="success" size="lg" />
      <div className="flex flex-col gap-2">
        <h1 className="t-h2 text-fg-primary">Password changed</h1>
        <p className="t-body-sm max-w-sm text-fg-secondary">
          For your security, every other session was signed out. Sign in again with your new
          password.
        </p>
      </div>
      <Button asChild>
        <Link href="/sign-in">Sign in</Link>
      </Button>
    </div>
  );
}
