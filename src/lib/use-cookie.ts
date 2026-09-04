"use client";

import * as React from "react";

function readCookie(name: string): string | null {
  return (
    document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${name}=`))
      ?.split("=")[1] ?? null
  );
}

// Cookies have no native change event — this is for a one-time read of a
// value set by a previous request/action, not live sync across tabs.
function subscribe() {
  return () => {};
}

/** Reads a cookie client-side, SSR-safe via useSyncExternalStore (server
 * snapshot is always null, avoiding a hydration mismatch). */
export function useCookie(name: string): string | null {
  return React.useSyncExternalStore(
    subscribe,
    () => readCookie(name),
    () => null,
  );
}
