"use client";

import * as React from "react";
import { Globe } from "lucide-react";

function subscribe(callback: () => void) {
  window.addEventListener("offline", callback);
  window.addEventListener("online", callback);
  return () => {
    window.removeEventListener("offline", callback);
    window.removeEventListener("online", callback);
  };
}

/** Names what still works offline. */
function OfflineBanner() {
  const offline = React.useSyncExternalStore(
    subscribe,
    () => !navigator.onLine,
    () => false,
  );

  if (!offline) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-0 top-0 z-[100] flex items-center justify-center gap-2 bg-bg-inverse px-4 py-2 text-center text-fg-inverse"
    >
      <Globe className="size-4 shrink-0" aria-hidden />
      <p className="t-body-xs">
        You&rsquo;re offline — lessons you&rsquo;ve already opened and quizzes in progress still
        work. Everything else syncs once you&rsquo;re back.
      </p>
    </div>
  );
}

export { OfflineBanner };
