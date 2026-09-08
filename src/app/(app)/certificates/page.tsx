import { Award } from "lucide-react";

import { EmptyState } from "@/components/lisaan/empty-state";
import { verifyStudentSession } from "@/lib/dal";
import { MAIN_COURSE_SLUG, getCourseForStudent } from "@/lib/courses";

export default async function CertificatesPage() {
  const session = await verifyStudentSession();
  const course = await getCourseForStudent(
    MAIN_COURSE_SLUG,
    session.studentId,
    session.planStatus === "premium",
  );
  const completed = course ? course.progressPct === 100 : false;

  return (
    <div className="rounded-2xl border border-stroke-default bg-bg-surface">
      {completed ? (
        <EmptyState
          icon={Award}
          title={`You finished ${course!.title}`}
          body="Certificate downloads are coming in a future release — for now, this page confirms you completed every lesson and quiz."
        />
      ) : (
        <EmptyState
          icon={Award}
          title="No certificates yet"
          body="Finish a course to earn a certificate — it'll show up here, ready to download and share."
        />
      )}
    </div>
  );
}
