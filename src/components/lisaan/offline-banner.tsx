"use client";

import * as React from "react";
import { Globe } from "lucide-react";

/** Names what still works offline. */
function OfflineBanner() {
  const [offline, setOffline] = React.useState(false);

  React.useEffect(() => {
    setOffline(!navigator.onLine);
    const goOffline = () => setOffline(true);
    const goOnline = () => setOffline(false);
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-0 top-0 z-[100] flex items-center justify-center gap-2 bg-bg-inverse px-4 py-2 text-center text-fg-inverse"
    >
      <Globe className="size-4 shrink-0" aria-hidden />
      <p className="t-body-xs">
        You're offline — lessons you've already opened and quizzes in progress still work.
        Everything else syncs once you're back.
      </p>
    </div>
  );
}

export { OfflineBanner };
