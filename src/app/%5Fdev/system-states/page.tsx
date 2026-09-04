"use client";

import * as React from "react";
import Link from "next/link";

import {
  MaintenanceState,
  PermissionDeniedState,
  RateLimitedState,
  SessionExpiredState,
} from "@/components/lisaan/system-states";

function Section({ title, id, children }: { title: string; id: string; children: React.ReactNode }) {
  return (
    <section id={id} className="border-t border-stroke-default pt-6 first:border-t-0 first:pt-0">
      <p className="t-overline mb-3 text-fg-tertiary">{title}</p>
      <div className="rounded-2xl border border-stroke-default bg-bg-canvas">{children}</div>
    </section>
  );
}

export default function SystemStatesGallery() {
  const [{ startsAt, endsAt }] = React.useState(() => ({
    startsAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
    endsAt: new Date(Date.now() + 4 * 60 * 60 * 1000),
  }));

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-10">
      <div>
        <p className="t-h2 text-fg-primary">System states</p>
        <p className="t-body-sm text-fg-tertiary">
          §10 of BUILD.md. 404 and 500 are real Next.js special files — visit any bad URL, or{" "}
          <Link href="/_dev/throw" className="text-fg-link hover:text-fg-link-hover">
            trigger a real error
          </Link>
          . Offline is live — turn off your network to see it globally. The rest render here since
          they need a real backend to trigger naturally.
        </p>
      </div>

      <Section title="Maintenance (503)" id="maintenance">
        <MaintenanceState startsAt={startsAt} endsAt={endsAt} />
      </Section>

      <Section title="Permission denied (403)" id="permission-denied">
        <PermissionDeniedState roleNeeded="Admin" />
      </Section>

      <Section title="Rate limited (429)" id="rate-limited">
        <RateLimitedState seconds={12} />
      </Section>

      <Section title="Session expired (401)" id="session-expired">
        <SessionExpiredState next="/dashboard" />
      </Section>
    </div>
  );
}
