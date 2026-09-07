"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Laptop, Smartphone, Tablet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { finishSignInAfterDeviceLimit, signOutDevice } from "../actions";

export interface DeviceSession {
  id: string;
  user_agent: string | null;
  last_used_at: string;
  created_at: string;
}

function deviceIcon(userAgent: string | null) {
  if (userAgent && /ipad|tablet/i.test(userAgent)) return Tablet;
  if (userAgent && /mobile|iphone|android/i.test(userAgent)) return Smartphone;
  return Laptop;
}

function summarizeUserAgent(userAgent: string | null): string {
  if (!userAgent) return "Unknown device";
  if (/ipad/i.test(userAgent)) return "iPad";
  if (/iphone/i.test(userAgent)) return "iPhone";
  if (/android/i.test(userAgent)) return "Android device";
  if (/macintosh/i.test(userAgent)) return "Mac";
  if (/windows/i.test(userAgent)) return "Windows PC";
  if (/linux/i.test(userAgent)) return "Linux";
  return "Browser session";
}

/** UTC and locale-independent so server render and client hydration always
 * agree — see auth-quote.tsx / system-states.tsx for the same constraint. */
function formatLastActive(iso: string): string {
  return `${iso.slice(0, 16).replace("T", " ")} UTC`;
}

export function DevicesList({ sessions, next }: { sessions: DeviceSession[]; next: string }) {
  const router = useRouter();
  const [list, setList] = React.useState(sessions);
  const [pending, setPending] = React.useState(false);

  async function signOut(id: string) {
    setPending(true);
    await signOutDevice(id);
    setList((current) => current.filter((s) => s.id !== id));
    const result = await finishSignInAfterDeviceLimit();
    setPending(false);
    if (result.ok) {
      router.push(next);
      router.refresh();
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="t-h2 text-fg-primary">You&rsquo;ve reached your device limit</h1>
        <p className="t-body-sm text-fg-secondary">
          Lisaan allows three signed-in devices at once. Sign one out to continue here.
        </p>
      </div>

      <ul className="flex flex-col gap-2">
        {list.map((session) => {
          const Icon = deviceIcon(session.user_agent);
          return (
            <li
              key={session.id}
              className="flex items-center gap-3 rounded-xl border border-stroke-default bg-bg-surface p-4"
            >
              <Icon className="size-5 shrink-0 text-fg-tertiary" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="t-body-sm-strong text-fg-primary">{summarizeUserAgent(session.user_agent)}</p>
                <p className="t-body-xs text-fg-tertiary">
                  Last active {formatLastActive(session.last_used_at)}
                </p>
              </div>
              <Button variant="secondary" size="sm" disabled={pending} onClick={() => signOut(session.id)}>
                Sign out
              </Button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
