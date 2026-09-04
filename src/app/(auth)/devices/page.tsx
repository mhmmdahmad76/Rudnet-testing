"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Laptop, Smartphone, Tablet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ONBOARDING_STEP_COOKIE, setDemoCookie } from "@/lib/session";

interface Device {
  id: string;
  name: string;
  icon: typeof Laptop;
  lastUsed: string;
}

const INITIAL_DEVICES: Device[] = [
  { id: "d1", name: "iPhone 15 — Dubai", icon: Smartphone, lastUsed: "Active now" },
  { id: "d2", name: "MacBook Air — Dubai", icon: Laptop, lastUsed: "2 hours ago" },
  { id: "d3", name: "iPad — Abu Dhabi", icon: Tablet, lastUsed: "6 days ago" },
];

export default function DevicesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";

  const [devices, setDevices] = React.useState(INITIAL_DEVICES);

  function signOut(id: string) {
    setDevices((current) => current.filter((device) => device.id !== id));
    setDemoCookie(ONBOARDING_STEP_COOKIE, "done");
    router.push(next);
    router.refresh();
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
        {devices.map((device) => (
          <li
            key={device.id}
            className="flex items-center gap-3 rounded-xl border border-stroke-default bg-bg-surface p-4"
          >
            <device.icon className="size-5 shrink-0 text-fg-tertiary" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="t-body-sm-strong text-fg-primary">{device.name}</p>
              <p className="t-body-xs text-fg-tertiary">{device.lastUsed}</p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => signOut(device.id)}>
              Sign out
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
