"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

const SOURCES = ["hero-1", "hero-2", "hero-3"];
const SLIDE_MS = 2000;

/** Cycles the three hero clips, 2s each, looping forever. All three stay
 * mounted and preloaded so switching is an opacity crossfade, not a reload —
 * a fresh `<video src>` per tick would flicker and re-buffer on every swap. */
function HeroVideoLoop() {
  const [active, setActive] = React.useState(0);
  const videoRefs = React.useRef<(HTMLVideoElement | null)[]>([]);

  React.useEffect(() => {
    const id = setInterval(() => {
      setActive((current) => (current + 1) % SOURCES.length);
    }, SLIDE_MS);
    return () => clearInterval(id);
  }, []);

  React.useEffect(() => {
    const video = videoRefs.current[active];
    if (!video) return;
    video.currentTime = 0;
    video.play().catch(() => {});
  }, [active]);

  return (
    <div className="absolute inset-0 overflow-hidden rounded-[inherit]">
      {SOURCES.map((name, index) => (
        <video
          key={name}
          ref={(el) => {
            videoRefs.current[index] = el;
          }}
          poster={index === 0 ? "/videos/hero-poster.jpg" : undefined}
          muted
          playsInline
          preload="auto"
          aria-hidden
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-in-out",
            index === active ? "opacity-100" : "opacity-0",
          )}
        >
          <source src={`/videos/${name}.webm`} type="video/webm" />
          <source src={`/videos/${name}.mp4`} type="video/mp4" />
        </video>
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />
    </div>
  );
}

export { HeroVideoLoop };
