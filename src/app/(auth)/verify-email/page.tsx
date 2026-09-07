import { redirect } from "next/navigation";

import { verifyStudentSession } from "@/lib/dal";
import { VerifyEmailForm } from "./verify-email-form";

export default async function VerifyEmailPage() {
  const session = await verifyStudentSession();
  if (session.emailVerified) {
    redirect(session.onboardingStep === "done" ? "/dashboard" : `/onboarding/${session.onboardingStep}`);
  }

  return <VerifyEmailForm email={session.email} />;
}
