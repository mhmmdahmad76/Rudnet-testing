import { verifyStudentSession } from "@/lib/dal";
import { QuizClient } from "./quiz-client";

export default async function QuizPage({
  params,
}: {
  params: Promise<{ course: string; quiz: string }>;
}) {
  const { course, quiz } = await params;
  const session = await verifyStudentSession();

  return <QuizClient course={course} quizId={quiz} isPremium={session.planStatus === "premium"} />;
}
