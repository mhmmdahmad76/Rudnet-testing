import { LessonRow } from "@/components/lisaan/lesson-row";
import { DEMO_COURSE, flattenItems, type LessonStatus } from "@/lib/demo-data";

export default function QuizzesPage() {
  const quizzes = flattenItems().filter(({ item }) => item.kind === "quiz");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="t-h2 text-fg-primary">Quizzes</h1>
      <div className="flex flex-col gap-1">
        {quizzes.map(({ unit, item }) => (
          <LessonRow
            key={item.id}
            status={item.status as LessonStatus}
            title={`${item.title} — ${unit.title}`}
            kind="Quiz"
            duration={item.duration}
            href={`/courses/${DEMO_COURSE.slug}/quiz/${item.id}`}
            lockedReason="Unlocks after the lesson before it"
          />
        ))}
      </div>
    </div>
  );
}
