import { cookies } from "next/headers";

import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale } from "@/lib/locale";
import { verifyStudentSession } from "@/lib/dal";
import {
  MAIN_COURSE_SLUG,
  flattenCourseItems,
  formatCourseMeta,
  formatDuration,
  getCourseForStudent,
  getDashboardStats,
  itemHref,
  resumeHref,
} from "@/lib/courses";
import DashboardClient from "./dashboard-client";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;
  const session = await verifyStudentSession();
  const isPremium = session.planStatus === "premium";

  const course = await getCourseForStudent(MAIN_COURSE_SLUG, session.studentId, isPremium);
  const stats = await getDashboardStats(session.studentId);

  const upNext = course
    ? flattenCourseItems(course)
        .slice(0, 3)
        .map(({ item }) => ({
          id: item.id,
          title: item.title,
          kind: item.kind === "quiz" ? ("Quiz" as const) : item.lessonKind!,
          duration: formatDuration(item.durationMinutes),
          status: item.status,
          href: itemHref(MAIN_COURSE_SLUG, item),
        }))
    : [];

  return (
    <DashboardClient
      name={session.name}
      level={session.level}
      levelSource={session.levelSource}
      locale={locale}
      course={
        course
          ? {
              title: course.title,
              meta: formatCourseMeta(course),
              progressPct: course.progressPct,
              resumeHref: resumeHref(MAIN_COURSE_SLUG, course),
              upNext,
            }
          : null
      }
      stats={stats}
    />
  );
}
