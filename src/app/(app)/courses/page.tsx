import { BookOpen } from "lucide-react";

import { CourseCard } from "@/components/lisaan/course-card";
import { EmptyState } from "@/components/lisaan/empty-state";
import { verifyStudentSession } from "@/lib/dal";
import { MAIN_COURSE_SLUG, formatCourseMeta, getCourseForStudent, resumeHref } from "@/lib/courses";

export default async function MyCoursesPage() {
  const session = await verifyStudentSession();
  const course = await getCourseForStudent(
    MAIN_COURSE_SLUG,
    session.studentId,
    session.planStatus === "premium",
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="t-h2 text-fg-primary">My courses</h1>
      {course ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <CourseCard
            href={resumeHref(MAIN_COURSE_SLUG, course) ?? `/courses/${MAIN_COURSE_SLUG}`}
            title={course.title}
            level={course.level}
            meta={formatCourseMeta(course)}
            progress={course.progressPct}
          />
        </div>
      ) : (
        <div className="rounded-2xl border border-stroke-default bg-bg-surface">
          <EmptyState icon={BookOpen} title="No courses yet" body="Check back soon." />
        </div>
      )}
    </div>
  );
}
