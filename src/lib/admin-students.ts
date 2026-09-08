import "server-only";

import { db } from "@/lib/db";
import type { AdminStudent } from "@/lib/use-student-filters";

// Real admin-facing student data — replaces DEMO_STUDENTS, a static array
// of 5 fake people that made real signups invisible to the instructor.

interface StudentRow {
  id: number;
  name: string;
  email: string;
  level: string | null;
  plan_status: "free" | "premium";
  plan_id: "monthly" | "annual" | null;
  suspended: boolean;
  email_verified: boolean;
  created_at: string;
  completed_items: number | string;
  has_pending_transfer: boolean;
}

async function totalCourseItems(): Promise<number> {
  const rows = await db().sql`SELECT COUNT(*)::int AS count FROM unit_items`;
  return (rows[0] as { count: number } | undefined)?.count ?? 0;
}

function toAdminStudent(row: StudentRow, totalItems: number): AdminStudent {
  const completed = Number(row.completed_items);
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    level: row.level,
    planStatus: row.plan_status,
    planId: row.plan_id,
    suspended: row.suspended,
    emailVerified: row.email_verified,
    createdAt: new Date(row.created_at).toISOString().slice(0, 10),
    progressPct: totalItems > 0 ? Math.round((completed / totalItems) * 100) : 0,
    pendingTransfer: row.has_pending_transfer,
  };
}

const LIST_QUERY_LIMIT = 1000;

export async function listStudents(): Promise<AdminStudent[]> {
  const totalItems = await totalCourseItems();
  const rows = (await db().sql`
    SELECT
      s.id, s.name, s.email, s.level, s.plan_status, s.plan_id, s.suspended, s.email_verified, s.created_at,
      COALESCE(lp.cnt, 0) + COALESCE(qp.cnt, 0) AS completed_items,
      COALESCE(pr.pending, FALSE) AS has_pending_transfer
    FROM students s
    LEFT JOIN (SELECT student_id, COUNT(*) AS cnt FROM lesson_progress GROUP BY student_id) lp
      ON lp.student_id = s.id
    LEFT JOIN (
      SELECT student_id, COUNT(DISTINCT item_id) AS cnt FROM quiz_attempts WHERE passed = TRUE GROUP BY student_id
    ) qp ON qp.student_id = s.id
    LEFT JOIN (
      SELECT student_id, TRUE AS pending FROM payment_requests WHERE status = 'pending' GROUP BY student_id
    ) pr ON pr.student_id = s.id
    ORDER BY s.created_at DESC
    LIMIT ${LIST_QUERY_LIMIT}
  `) as unknown as StudentRow[];

  return rows.map((row) => toAdminStudent(row, totalItems));
}

export async function getStudentById(id: number): Promise<AdminStudent | null> {
  const totalItems = await totalCourseItems();
  const rows = (await db().sql`
    SELECT
      s.id, s.name, s.email, s.level, s.plan_status, s.plan_id, s.suspended, s.email_verified, s.created_at,
      COALESCE(lp.cnt, 0) + COALESCE(qp.cnt, 0) AS completed_items,
      COALESCE(pr.pending, FALSE) AS has_pending_transfer
    FROM students s
    LEFT JOIN (SELECT student_id, COUNT(*) AS cnt FROM lesson_progress WHERE student_id = ${id} GROUP BY student_id) lp
      ON lp.student_id = s.id
    LEFT JOIN (
      SELECT student_id, COUNT(DISTINCT item_id) AS cnt FROM quiz_attempts
      WHERE passed = TRUE AND student_id = ${id} GROUP BY student_id
    ) qp ON qp.student_id = s.id
    LEFT JOIN (
      SELECT student_id, TRUE AS pending FROM payment_requests
      WHERE status = 'pending' AND student_id = ${id} GROUP BY student_id
    ) pr ON pr.student_id = s.id
    WHERE s.id = ${id}
  `) as unknown as StudentRow[];

  const row = rows[0];
  return row ? toAdminStudent(row, totalItems) : null;
}

export async function setStudentSuspended(id: number, suspended: boolean) {
  await db().sql`UPDATE students SET suspended = ${suspended} WHERE id = ${id}`;
}

export async function grantPremium(id: number) {
  await db().sql`UPDATE students SET plan_status = 'premium' WHERE id = ${id}`;
}

export async function setStudentLevel(id: number, level: string) {
  await db().sql`UPDATE students SET level = ${level}, level_source = 'admin' WHERE id = ${id}`;
}

export interface PaymentRequestRow {
  id: number;
  studentId: number;
  studentName: string;
  studentEmail: string;
  method: "transfer";
  planId: "monthly" | "annual";
  amount: number;
  currency: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  receiptKey: string | null;
  receiptFilename: string | null;
}

export async function listPendingPaymentRequests(): Promise<PaymentRequestRow[]> {
  const rows = await db().sql`
    SELECT pr.id, pr.student_id, s.name AS student_name, s.email AS student_email,
           pr.method, pr.plan_id, pr.amount, pr.currency, pr.status, pr.created_at,
           pr.receipt_key, pr.receipt_filename
    FROM payment_requests pr
    JOIN students s ON s.id = pr.student_id
    WHERE pr.status = 'pending'
    ORDER BY pr.created_at ASC
  `;
  return (
    rows as unknown as {
      id: number;
      student_id: number;
      student_name: string;
      student_email: string;
      method: "transfer";
      plan_id: "monthly" | "annual";
      amount: string;
      currency: string;
      status: "pending" | "approved" | "rejected";
      created_at: string;
      receipt_key: string | null;
      receipt_filename: string | null;
    }[]
  ).map((r) => ({
    id: r.id,
    studentId: r.student_id,
    studentName: r.student_name,
    studentEmail: r.student_email,
    method: r.method,
    planId: r.plan_id,
    amount: Number(r.amount),
    currency: r.currency,
    status: r.status,
    createdAt: r.created_at,
    receiptKey: r.receipt_key,
    receiptFilename: r.receipt_filename,
  }));
}

/** Looked up separately (not via listPendingPaymentRequests) when resolving
 * one request from the receipt-download route, which only has the id. */
export async function getPaymentRequestById(id: number) {
  const rows = await db().sql`SELECT receipt_key, receipt_filename FROM payment_requests WHERE id = ${id}`;
  const row = rows[0] as { receipt_key: string | null; receipt_filename: string | null } | undefined;
  if (!row) return null;
  return { receiptKey: row.receipt_key, receiptFilename: row.receipt_filename };
}

export async function resolvePaymentRequest(
  requestId: number,
  decision: "approved" | "rejected",
  adminId: number,
) {
  const rows = await db().sql`
    UPDATE payment_requests SET status = ${decision}, resolved_at = NOW(), resolved_by = ${adminId}
    WHERE id = ${requestId} AND status = 'pending'
    RETURNING student_id, plan_id
  `;
  const row = rows[0] as { student_id: number; plan_id: "monthly" | "annual" } | undefined;
  if (!row) return { ok: false as const, reason: "not-found" };

  if (decision === "approved") {
    await db().sql`
      UPDATE students SET plan_status = 'premium', plan_id = ${row.plan_id} WHERE id = ${row.student_id}
    `;
  }
  return { ok: true as const };
}
