import { cookies } from "next/headers";
import Link from "next/link";
import { Compass } from "lucide-react";

import { Button } from "@/components/ui/button";
import { IconChip } from "@/components/lisaan/icon-chip";
import { SESSION_COOKIE } from "@/lib/session";

/** Plain explanation + the three most likely destinations. */
export default async function NotFound() {
  const cookieStore = await cookies();
  const signedIn = cookieStore.has(SESSION_COOKIE);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg-canvas p-8 text-center">
      <IconChip icon={Compass} tone="neutral" size="lg" />
      <div className="flex flex-col gap-2">
        <p className="t-h2 text-fg-primary">This page doesn't exist</p>
        <p className="t-body-sm max-w-sm text-fg-tertiary">
          The link might be old, or the address was typed wrong. Here's where you probably meant
          to go.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button asChild>
          <Link href={signedIn ? "/dashboard" : "/"}>{signedIn ? "Go to dashboard" : "Go home"}</Link>
        </Button>
        {signedIn ? (
          <Button asChild variant="secondary">
            <Link href="/courses">My courses</Link>
          </Button>
        ) : (
          <Button asChild variant="secondary">
            <Link href="/sign-in">Sign in</Link>
          </Button>
        )}
        <Button asChild variant="ghost">
          <Link href="mailto:support@lisaan.app">Contact support</Link>
        </Button>
      </div>
    </div>
  );
}
