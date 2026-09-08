"use server";

import { verifyAdminSession } from "@/lib/dal";
import {
  grantPremium,
  listStudents,
  resolvePaymentRequest,
  setStudentLevel,
  setStudentSuspended,
} from "@/lib/admin-students";
import { sendAdminBroadcastEmail } from "@/lib/email";

export async function suspendStudentAction(id: number, suspended: boolean) {
  await verifyAdminSession();
  await setStudentSuspended(id, suspended);
  return { ok: true as const };
}

export async function grantAccessAction(id: number) {
  await verifyAdminSession();
  await grantPremium(id);
  return { ok: true as const };
}

export async function changeStudentLevelAction(id: number, level: string) {
  await verifyAdminSession();
  await setStudentLevel(id, level);
  return { ok: true as const };
}

export async function resolvePaymentRequestAction(requestId: number, decision: "approved" | "rejected") {
  const admin = await verifyAdminSession();
  return resolvePaymentRequest(requestId, decision, admin.adminId);
}

/** Real send via Resend to every recipient — one request per student, run
 * concurrently. A recipient whose email fails doesn't block the others;
 * failures are collected and reported back so the admin sees exactly who
 * wasn't reached instead of a blind "sent". */
export async function emailStudentsAction(studentIds: number[], subject: string, body: string) {
  await verifyAdminSession();
  if (studentIds.length === 0) return { ok: true as const, failed: [] as string[] };

  const students = await listStudents();
  const recipients = students.filter((s) => studentIds.includes(s.id));

  const results = await Promise.allSettled(
    recipients.map((student) => sendAdminBroadcastEmail(student.email, subject, body)),
  );

  const failed = recipients
    .filter((_, i) => results[i]!.status === "rejected")
    .map((s) => s.email);

  return { ok: true as const, failed };
}
