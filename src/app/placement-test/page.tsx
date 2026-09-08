import { verifyStudentSession } from "@/lib/dal";
import { getPlacementQuestions } from "@/app/(auth)/actions";
import { PlacementTestClient } from "./placement-test-client";

export default async function PlacementTestPage() {
  await verifyStudentSession();
  const questions = await getPlacementQuestions();

  return <PlacementTestClient questions={questions} />;
}
