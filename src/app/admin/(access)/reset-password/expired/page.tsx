import Link from "next/link";
import { Clock } from "lucide-react";

import { IconChip } from "@/components/lisaan/icon-chip";
import { Button } from "@/components/ui/button";

export default function AdminResetPasswordExpiredPage() {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <IconChip icon={Clock} tone="warning" size="lg" />
      <div className="flex flex-col gap-2">
        <h1 className="t-h2 text-fg-primary">This link has expired</h1>
        <p className="t-body-sm max-w-sm text-fg-secondary">
          Reset links last one hour and work once. Send yourself a new one.
        </p>
      </div>
      <Button asChild>
        <Link href="/admin/forgot-password">Send a new link</Link>
      </Button>
    </div>
  );
}
