import { notFound } from "next/navigation";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { verifyAdminSession } from "@/lib/dal";
import { getStudentById } from "@/lib/admin-students";

export default async function AdminStudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await verifyAdminSession();

  const studentId = Number(id);
  if (!Number.isInteger(studentId)) notFound();
  const student = await getStudentById(studentId);
  if (!student) notFound();

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div className="flex items-center gap-4">
        <Avatar name={student.name} size="lg" />
        <div>
          <div className="flex items-center gap-2">
            <p className="t-h3 text-fg-primary">{student.name}</p>
            <Badge tone={student.planStatus === "premium" ? "success" : "neutral"}>
              {student.planStatus === "premium" ? "Premium" : "Free"}
            </Badge>
            {student.suspended && <Badge tone="danger">Suspended</Badge>}
          </div>
          <p className="t-body-sm text-fg-tertiary">{student.email}</p>
        </div>
      </div>

      <div className="grid gap-4 rounded-2xl border border-stroke-default bg-bg-surface p-6 sm:grid-cols-2">
        <div>
          <p className="t-body-xs text-fg-tertiary">Level</p>
          <p className="t-h5 text-fg-primary">{student.level ?? "Not set"}</p>
        </div>
        <div>
          <p className="t-body-xs text-fg-tertiary">Joined</p>
          <p className="t-numeric-md text-fg-primary">{student.createdAt}</p>
        </div>
        <div className="sm:col-span-2">
          <p className="t-body-xs mb-2 text-fg-tertiary">Course progress</p>
          <Progress value={student.progressPct} />
        </div>
        <div>
          <p className="t-body-xs text-fg-tertiary">Email verified</p>
          <p className="t-body-sm text-fg-primary">{student.emailVerified ? "Yes" : "No"}</p>
        </div>
        <div>
          <p className="t-body-xs text-fg-tertiary">Plan</p>
          <p className="t-body-sm text-fg-primary">
            {student.planId ? `${student.planId} (premium)` : student.planStatus === "premium" ? "Comped access" : "Free"}
          </p>
        </div>
        {student.pendingTransfer && (
          <div className="sm:col-span-2">
            <p className="t-body-xs text-fg-tertiary">Payment</p>
            <p className="t-body-sm text-fg-warning">Has a bank transfer awaiting your review — see Payments.</p>
          </div>
        )}
      </div>
    </div>
  );
}
