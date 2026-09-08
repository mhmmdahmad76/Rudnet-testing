import { verifyStudentSession } from "@/lib/dal";
import { LessonClient } from "./lesson-client";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ course: string; lesson: string }>;
}) {
  const { course, lesson } = await params;
  const session = await verifyStudentSession();

  return <LessonClient course={course} lessonId={lesson} isPremium={session.planStatus === "premium"} />;
}
