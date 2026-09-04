import Link from "next/link";
import { BookOpen, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DEMO_COURSE } from "@/lib/demo-data";

export default function AdminCoursesPage() {
  const lessonCount = DEMO_COURSE.units.flatMap((u) => u.items).filter((i) => i.kind === "lesson").length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="t-h2 text-fg-primary">Courses</h1>
        <Button asChild icon={<Plus />}>
          <Link href="/admin/courses/new">New course</Link>
        </Button>
      </div>

      <Link
        href={`/admin/courses/${DEMO_COURSE.slug}`}
        className="flex items-center gap-4 rounded-2xl border border-stroke-default bg-bg-surface p-5 outline-none transition-shadow hover:shadow-(--elev-02) focus-visible:shadow-(--elev-focus)"
      >
        <div className="flex size-12 items-center justify-center rounded-xl bg-bg-brand-subtle text-fg-brand">
          <BookOpen className="size-6" aria-hidden />
        </div>
        <div className="flex-1">
          <p className="t-h5 text-fg-primary">{DEMO_COURSE.title}</p>
          <p className="t-body-xs text-fg-tertiary">
            {DEMO_COURSE.level} · {DEMO_COURSE.units.length} units · {lessonCount} lessons
          </p>
        </div>
        <Badge tone="success">Published</Badge>
      </Link>
    </div>
  );
}
