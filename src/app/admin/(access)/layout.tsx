import type { ReactNode } from "react";
import Link from "next/link";

import { Logo } from "@/components/lisaan/logo";

/** Admin access screens run in dark mode — everything behind the login is light. */
export default function AdminAccessLayout({ children }: { children: ReactNode }) {
  return (
    <div
      data-theme="dark"
      className="flex min-h-screen flex-col items-center justify-center gap-8 bg-bg-canvas p-5 text-fg-primary"
    >
      <Link href="/admin/sign-in" className="flex items-center gap-2">
        <Logo />
        <span className="t-overline rounded-full bg-bg-subtle px-2 py-0.5 text-fg-tertiary">
          Admin
        </span>
      </Link>
      <div className="w-full max-w-md rounded-3xl border border-stroke-default bg-bg-surface p-8 shadow-(--elev-03)">
        {children}
      </div>
    </div>
  );
}
