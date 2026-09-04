import Link from "next/link";
import { Mail } from "lucide-react";

import { IconChip } from "@/components/lisaan/icon-chip";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordSentPage() {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <IconChip icon={Mail} tone="brand" size="lg" />
      <div className="flex flex-col gap-2">
        <h1 className="t-h2 text-fg-primary">Check your inbox</h1>
        {/* Must not confirm registration either way. */}
        <p className="t-body-sm max-w-sm text-fg-secondary">
          If that address has an account, we've sent a link to reset the password. The link works
          once and lasts one hour.
        </p>
      </div>
      <Button asChild variant="secondary">
        <Link href="/sign-in">Back to sign in</Link>
      </Button>
    </div>
  );
}
