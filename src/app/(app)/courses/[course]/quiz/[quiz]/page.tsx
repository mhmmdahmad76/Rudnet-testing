import { notFound } from "next/navigation";

import { verifyStudentSession } from "@/lib/dal";
import { findQuizForStudent } from "@/lib/courses";
import { submitQuizAttemptAction } from "@/app/(auth)/actions";
import { QuizClient } from "./quiz-client";

export default async function QuizPage({
  params,
}: {
  params: Promise<{ course: string; quiz: string }>;
}) {
  const { course: courseSlug, quiz: quizId } = await params;
  const session = await verifyStudentSession();
  const isPremium = session.planStatus === "premium";

  const found = await findQuizForStudent(courseSlug, quizId, session.studentId, isPremium);
  if (!found) notFound();

  const { unit, item, questions, attemptsUsed } = found;
  const attemptsLeft = (item.attemptsAllowed ?? 0) - attemptsUsed;

  return (
    <QuizClient
      courseSlug={courseSlug}
      quizId={quizId}
      requiresPremium={item.requiresPremium}
      title={item.title}
      unitTitle={unit.title}
      passMark={item.passMark ?? 60}
      attemptsAllowed={item.attemptsAllowed ?? 0}
      attemptsLeft={attemptsLeft}
      questions={questions}
      submitAction={submitQuizAttemptAction}
    />
  );
}
