import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

import { db } from "@/lib/db";
import { randomToken } from "@/lib/crypto";
import {
  ADMIN_COOKIE,
  STUDENT_COOKIE,
  type AdminClaims,
  type StudentClaims,
} from "@/lib/session-cookies";

export { ADMIN_COOKIE, STUDENT_COOKIE, type AdminClaims, type StudentClaims };

const secretKey = process.env.SESSION_SECRET;
if (!secretKey) {
  throw new Error(
    "SESSION_SECRET is not set. Generate one with `openssl rand -base64 32` and set it as an environment variable.",
  );
}
const encodedKey = new TextEncoder().encode(secretKey);

const PENDING_STUDENT_COOKIE = "lisaan_pending_student";

const SESSION_DAYS = 30;

interface PendingStudentClaims {
  kind: "pending-student";
  studentId: number;
}

async function sign(payload: Record<string, unknown>, expiresIn: string) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(encodedKey);
}

async function verify<T>(token: string | undefined): Promise<T | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, encodedKey, { algorithms: ["HS256"] });
    return payload as unknown as T;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Student sessions
// ---------------------------------------------------------------------------

export async function createStudentSession(
  studentId: number,
  claims: { emailVerified: boolean; onboardingStep: string },
  options: { rememberDays?: number; userAgent?: string | null } = {},
) {
  const sid = randomToken();
  const days = options.rememberDays ?? SESSION_DAYS;
  const expiresAt = new Date(Date.now() + days * 86400 * 1000);

  await db().sql`
    INSERT INTO sessions (id, kind, subject_id, two_factor_verified, user_agent, expires_at)
    VALUES (${sid}, 'student', ${studentId}, TRUE, ${options.userAgent ?? null}, ${expiresAt.toISOString()})
  `;

  const token = await sign(
    { kind: "student", sid, studentId, emailVerified: claims.emailVerified, onboardingStep: claims.onboardingStep },
    `${days}d`,
  );

  (await cookies()).set(STUDENT_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

/** Re-signs the student cookie after email_verified or onboarding_step changes in the DB. */
export async function refreshStudentClaims(patch: Partial<Pick<StudentClaims, "emailVerified" | "onboardingStep">>) {
  const current = await getStudentClaims();
  if (!current) return;
  const next = { ...current, ...patch };
  const token = await sign(next, `${SESSION_DAYS}d`);
  (await cookies()).set(STUDENT_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 86400,
  });
}

export async function getStudentClaims(): Promise<StudentClaims | null> {
  const token = (await cookies()).get(STUDENT_COOKIE)?.value;
  return verify<StudentClaims>(token);
}

export async function destroyStudentSession() {
  const claims = await getStudentClaims();
  if (claims) {
    await db().sql`DELETE FROM sessions WHERE id = ${claims.sid}`;
  }
  (await cookies()).delete(STUDENT_COOKIE);
}

export async function countActiveStudentSessions(studentId: number): Promise<number> {
  const rows = await db().sql`
    SELECT COUNT(*)::int AS count FROM sessions
    WHERE kind = 'student' AND subject_id = ${studentId} AND expires_at > NOW()
  `;
  return (rows[0]?.count as number) ?? 0;
}

export async function listActiveStudentSessions(studentId: number) {
  return db().sql`
    SELECT id, user_agent, last_used_at, created_at FROM sessions
    WHERE kind = 'student' AND subject_id = ${studentId} AND expires_at > NOW()
    ORDER BY last_used_at DESC
  `;
}

export async function deleteStudentSession(sessionId: string, studentId: number) {
  await db().sql`
    DELETE FROM sessions WHERE id = ${sessionId} AND kind = 'student' AND subject_id = ${studentId}
  `;
}

// A short-lived, student-identifying cookie for the gap between "password
// verified" and "session created" when the device limit sends the user to
// /devices first — never holds anything as sensitive as the real session.
export async function createPendingStudentCookie(studentId: number) {
  const token = await sign({ kind: "pending-student", studentId }, "5m");
  (await cookies()).set(PENDING_STUDENT_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 5 * 60,
  });
}

export async function getPendingStudentId(): Promise<number | null> {
  const token = (await cookies()).get(PENDING_STUDENT_COOKIE)?.value;
  const claims = await verify<PendingStudentClaims>(token);
  return claims?.studentId ?? null;
}

export async function clearPendingStudentCookie() {
  (await cookies()).delete(PENDING_STUDENT_COOKIE);
}

// ---------------------------------------------------------------------------
// Admin sessions
// ---------------------------------------------------------------------------

export async function createAdminSession(adminId: number, twoFactorVerified: boolean) {
  const sid = randomToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400 * 1000);

  await db().sql`
    INSERT INTO sessions (id, kind, subject_id, two_factor_verified, expires_at)
    VALUES (${sid}, 'admin', ${adminId}, ${twoFactorVerified}, ${expiresAt.toISOString()})
  `;

  const token = await sign({ kind: "admin", sid, adminId, twoFactorVerified }, `${SESSION_DAYS}d`);
  (await cookies()).set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function markAdminSessionVerified() {
  const claims = await getAdminClaims();
  if (!claims) return;
  await db().sql`UPDATE sessions SET two_factor_verified = TRUE WHERE id = ${claims.sid}`;
  const token = await sign({ ...claims, twoFactorVerified: true }, `${SESSION_DAYS}d`);
  (await cookies()).set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 86400,
  });
}

export async function getAdminClaims(): Promise<AdminClaims | null> {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  return verify<AdminClaims>(token);
}

export async function destroyAdminSession() {
  const claims = await getAdminClaims();
  if (claims) {
    await db().sql`DELETE FROM sessions WHERE id = ${claims.sid}`;
  }
  (await cookies()).delete(ADMIN_COOKIE);
}
