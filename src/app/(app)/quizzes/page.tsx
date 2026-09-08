import { LessonRow } from "@/components/lisaan/lesson-row";
import { verifyStudentSession } from "@/lib/dal";
import { MAIN_COURSE_SLUG, flattenCourseItems, formatDuration, getCourseForStudent, itemHref } from "@/lib/courses";

export default async function QuizzesPage() {
  const session = await verifyStudentSession();
  const course = await getCourseForStudent(
    MAIN_COURSE_SLUG,
    session.studentId,
    session.planStatus === "premium",
  );
  const quizzes = course
    ? flattenCourseItems(course).filter(({ item }) => item.kind === "quiz")
    : [];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="t-h2 text-fg-primary">Quizzes</h1>
      <div className="flex flex-col gap-1">
        {quizzes.map(({ unit, item }) => (
          <LessonRow
            key={item.id}
            status={item.status}
            title={`${item.title} — ${unit.title}`}
            kind="Quiz"
            duration={formatDuration(item.durationMinutes)}
            href={itemHref(MAIN_COURSE_SLUG, item)}
            lockedReason="Unlocks after the lesson before it"
          />
        ))}
      </div>
    </div>
  );
}
