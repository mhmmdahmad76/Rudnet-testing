import { notFound } from "next/navigation";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DEMO_STUDENTS } from "@/lib/demo-data";

const STATUS_TONE = { active: "success", trial: "brand", pending: "warning", lapsed: "danger" } as const;

export default async function AdminStudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const student = DEMO_STUDENTS.find((s) => s.id === id);
  if (!student) notFound();

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div className="flex items-center gap-4">
        <Avatar name={student.name} size="lg" />
        <div>
          <div className="flex items-center gap-2">
            <p className="t-h3 text-fg-primary">{student.name}</p>
            <Badge tone={STATUS_TONE[student.status]}>{student.status}</Badge>
          </div>
          <p className="t-body-sm text-fg-tertiary">{student.email}</p>
        </div>
      </div>

      <div className="grid gap-4 rounded-2xl border border-stroke-default bg-bg-surface p-6 sm:grid-cols-2">
        <div>
          <p className="t-body-xs text-fg-tertiary">Level</p>
          <p className="t-h5 text-fg-primary">{student.level}</p>
        </div>
        <div>
          <p className="t-body-xs text-fg-tertiary">Joined</p>
          <p className="t-numeric-md text-fg-primary">{student.joinedAt}</p>
        </div>
        <div className="sm:col-span-2">
          <p className="t-body-xs mb-2 text-fg-tertiary">Course progress</p>
          <Progress value={student.progressPct} />
        </div>
        <div>
          <p className="t-body-xs text-fg-tertiary">Payment method</p>
          <p className="t-body-sm text-fg-primary">{student.paymentMethod ?? "—"}</p>
        </div>
        <div>
          <p className="t-body-xs text-fg-tertiary">Payment state</p>
          <p className="t-body-sm text-fg-primary">{student.paymentState ?? "—"}</p>
        </div>
      </div>
    </div>
  );
}
