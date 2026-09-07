import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { getAdminClaims, getStudentClaims } from "@/lib/session";

/**
 * The real authorization boundary. proxy.ts only reads the signed cookie
 * (fast, no DB — see Next.js's own guidance on optimistic vs. secure
 * checks). These functions re-check against the database on every call
 * they're not called from, so a session deleted server-side (sign-out from
 * another device, an admin suspending an account) takes effect immediately
 * instead of waiting for a JWT to expire.
 */

export interface StudentSession {
  studentId: number;
  name: string;
  email: string;
  emailVerified: boolean;
  onboardingStep: string;
}

export const verifyStudentSession = cache(async (): Promise<StudentSession> => {
  const claims = await getStudentClaims();
  if (!claims) redirect("/sign-in");

  const rows = await db().sql`
    SELECT s.name, s.email, s.email_verified, s.onboarding_step, s.suspended
    FROM sessions sess
    JOIN students s ON s.id = sess.subject_id
    WHERE sess.id = ${claims.sid} AND sess.kind = 'student' AND sess.expires_at > NOW()
  `;
  const row = rows[0] as
    | { name: string; email: string; email_verified: boolean; onboarding_step: string; suspended: boolean }
    | undefined;
  if (!row) redirect("/sign-in");
  if (row.suspended) redirect("/sign-in");

  void db().sql`UPDATE sessions SET last_used_at = NOW() WHERE id = ${claims.sid}`;

  return {
    studentId: claims.studentId,
    name: row.name,
    email: row.email,
    emailVerified: row.email_verified,
    onboardingStep: row.onboarding_step,
  };
});

/** Like verifyStudentSession, but returns null instead of redirecting — for
 * layouts/pages that render differently rather than bouncing (e.g. marketing
 * pages that greet a signed-in visitor by name). */
export const getOptionalStudentSession = cache(async (): Promise<StudentSession | null> => {
  const claims = await getStudentClaims();
  if (!claims) return null;
  const rows = await db().sql`
    SELECT s.name, s.email, s.email_verified, s.onboarding_step, s.suspended
    FROM sessions sess
    JOIN students s ON s.id = sess.subject_id
    WHERE sess.id = ${claims.sid} AND sess.kind = 'student' AND sess.expires_at > NOW()
  `;
  const row = rows[0] as
    | { name: string; email: string; email_verified: boolean; onboarding_step: string; suspended: boolean }
    | undefined;
  if (!row || row.suspended) return null;
  return {
    studentId: claims.studentId,
    name: row.name,
    email: row.email,
    emailVerified: row.email_verified,
    onboardingStep: row.onboarding_step,
  };
});

export interface AdminSession {
  adminId: number;
  email: string;
}

export const verifyAdminSession = cache(
  async (options: { requireTwoFactor?: boolean } = {}): Promise<AdminSession> => {
    const requireTwoFactor = options.requireTwoFactor ?? true;
    const claims = await getAdminClaims();
    if (!claims) redirect("/admin/sign-in");

    const rows = await db().sql`
      SELECT a.email, sess.two_factor_verified
      FROM sessions sess
      JOIN admin_users a ON a.id = sess.subject_id
      WHERE sess.id = ${claims.sid} AND sess.kind = 'admin' AND sess.expires_at > NOW()
    `;
    const row = rows[0] as { email: string; two_factor_verified: boolean } | undefined;
    if (!row) redirect("/admin/sign-in");
    if (requireTwoFactor && !row.two_factor_verified) redirect("/admin/2fa");

    return { adminId: claims.adminId, email: row.email };
  },
);
