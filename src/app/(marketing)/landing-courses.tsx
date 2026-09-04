"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { CourseCard } from "@/components/lisaan/course-card";

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
type Level = (typeof LEVELS)[number];

const LANDING_COURSES: { slug: string; title: string; level: Level; meta: string }[] = [
  { slug: "business-english", title: "Business English Essentials", level: "B1", meta: "18 lessons · 5h 20m" },
  { slug: "everyday-conversation", title: "Everyday Conversation", level: "A2", meta: "14 lessons · 3h 45m" },
  { slug: "ielts-prep", title: "IELTS Preparation", level: "C1", meta: "22 lessons · 7h 10m" },
];

/** The CEFR chips here only set client-side filter state — they do not navigate. */
function LandingCourses() {
  const [level, setLevel] = React.useState<Level | null>(null);
  const visible = level ? LANDING_COURSES.filter((course) => course.level === level) : LANDING_COURSES;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter by level">
        {LEVELS.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => setLevel((current) => (current === chip ? null : chip))}
            className={cn(
              "t-label-sm flex size-8 items-center justify-center rounded-full border transition-colors outline-none focus-visible:shadow-(--elev-focus)",
              level === chip
                ? "border-stroke-brand bg-bg-brand text-fg-on-brand"
                : "border-stroke-default text-fg-secondary hover:bg-bg-hover",
            )}
          >
            {chip}
          </button>
        ))}
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((course) => (
          <CourseCard
            key={course.slug}
            href="/sign-up"
            title={course.title}
            level={course.level}
            meta={course.meta}
          />
        ))}
      </div>
    </div>
  );
}

export { LandingCourses };
