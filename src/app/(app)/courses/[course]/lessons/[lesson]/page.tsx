import { notFound } from "next/navigation";

import { verifyStudentSession } from "@/lib/dal";
import { findLessonForStudent, flattenCourseItems, formatDuration, itemHref } from "@/lib/courses";
import { markLessonCompleteAction } from "@/app/(auth)/actions";
import { LessonClient } from "./lesson-client";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ course: string; lesson: string }>;
}) {
  const { course: courseSlug, lesson: lessonId } = await params;
  const session = await verifyStudentSession();
  const isPremium = session.planStatus === "premium";

  const found = await findLessonForStudent(courseSlug, lessonId, session.studentId, isPremium);
  if (!found) notFound();

  const { course, unit, item } = found;
  const flat = flattenCourseItems(course);
  const index = flat.findIndex(({ item: i }) => i.id === item.id);
  const previous = index > 0 ? flat[index - 1] : null;
  const next = index < flat.length - 1 ? flat[index + 1] : null;
  const rail = flat.slice(0, 5);

  return (
    <LessonClient
      courseSlug={courseSlug}
      requiresPremium={item.requiresPremium}
      lesson={{
        id: item.id,
        title: item.title,
        lessonKind: item.lessonKind!,
        duration: formatDuration(item.durationMinutes),
      }}
      unit={{
        title: unit.title,
        items: unit.items.map((i) => ({
          id: i.id,
          kind: i.kind,
          title: i.title,
          lessonKind: i.lessonKind,
          duration: formatDuration(i.durationMinutes),
          status: i.status,
          href: itemHref(courseSlug, i),
        })),
      }}
      index={index}
      totalItems={flat.length}
      previousHref={previous ? itemHref(courseSlug, previous.item) : null}
      nextHref={next ? itemHref(courseSlug, next.item) : null}
      rail={rail.map(({ item: i }) => ({
        id: i.id,
        kind: i.kind,
        title: i.title,
        lessonKind: i.lessonKind,
        duration: formatDuration(i.durationMinutes),
        status: i.status,
        href: itemHref(courseSlug, i),
      }))}
      markCompleteAction={markLessonCompleteAction}
    />
  );
}
