"use server";

import { headers } from "next/headers";

import { db } from "@/lib/db";
import { hashPassword, randomDigitCode, randomToken, sha256Hex, verifyHash, verifyPassword } from "@/lib/crypto";
import { sendPasswordResetEmail, sendVerificationEmail } from "@/lib/email";
import { verifyStudentSession } from "@/lib/dal";
import { getPublicQuestions, scorePlacementTest } from "@/lib/placement-test";
import {
  clearPendingStudentCookie,
  countActiveStudentSessions,
  createPendingStudentCookie,
  createStudentSession,
  deleteStudentSession,
  destroyStudentSession,
  getPendingStudentId,
  listActiveStudentSessions,
  refreshStudentClaims,
} from "@/lib/session";

const DEVICE_LIMIT = 3;
const CODE_TTL_MINUTES = 10;
const RESEND_COOLDOWN_SECONDS = 60;
const LOCKOUT_SECONDS = 15 * 60;
const MAX_ATTEMPTS = 3;

interface StudentRow {
  id: number;
  password_hash: string;
  email_verified: boolean;
  onboarding_step: string;
  suspended: boolean;
  failed_login_attempts: number;
  locked_until: string | null;
}

function appUrl() {
  return process.env.URL ?? process.env.DEPLOY_PRIME_URL ?? "http://localhost:3000";
}

async function issueVerificationCode(studentId: number, email: string) {
  const code = randomDigitCode(6);
  const expiresAt = new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000);
  await db().sql`
    INSERT INTO email_verification_codes (student_id, code_hash, expires_at)
    VALUES (${studentId}, ${sha256Hex(code)}, ${expiresAt.toISOString()})
  `;
  await sendVerificationEmail(email, code);
}

export async function signUp(input: { name: string; email: string; password: string; country: string }) {
  const email = input.email.trim().toLowerCase();
  const existing = await db().sql`SELECT id FROM students WHERE email = ${email}`;
  if (existing.length > 0) {
    return {
      ok: false as const,
      error: "That address already has an account — sign in instead.",
      emailTaken: true,
    };
  }

  const passwordHash = hashPassword(input.password);
  const rows = await db().sql`
    INSERT INTO students (name, email, password_hash, country)
    VALUES (${input.name.trim()}, ${email}, ${passwordHash}, ${input.country})
    RETURNING id
  `;
  const studentId = (rows[0] as { id: number }).id;

  const userAgent = (await headers()).get("user-agent");
  await createStudentSession(studentId, { emailVerified: false, onboardingStep: "level" }, { userAgent });
  await issueVerificationCode(studentId, email);

  return { ok: true as const };
}

export async function resendVerificationCode() {
  const session = await verifyStudentSession();
  if (session.emailVerified) return { ok: true as const };

  const rows = await db().sql`
    SELECT created_at FROM email_verification_codes
    WHERE student_id = ${session.studentId}
    ORDER BY created_at DESC LIMIT 1
  `;
  const latest = rows[0] as { created_at: string } | undefined;
  if (latest) {
    const ageSeconds = (Date.now() - new Date(latest.created_at).getTime()) / 1000;
    if (ageSeconds < RESEND_COOLDOWN_SECONDS) {
      return { ok: false as const, retryInSeconds: Math.ceil(RESEND_COOLDOWN_SECONDS - ageSeconds) };
    }
  }

  await issueVerificationCode(session.studentId, session.email);
  return { ok: true as const };
}

export async function verifyEmailCode(code: string) {
  const session = await verifyStudentSession();
  if (session.emailVerified) return { ok: true as const };

  const rows = await db().sql`
    SELECT id, code_hash, expires_at, attempts FROM email_verification_codes
    WHERE student_id = ${session.studentId}
    ORDER BY created_at DESC LIMIT 1
  `;
  const row = rows[0] as
    | { id: number; code_hash: string; expires_at: string; attempts: number }
    | undefined;

  if (!row || new Date(row.expires_at) < new Date()) {
    return { ok: false as const, error: "expired" as const };
  }
  if (row.attempts >= 5) {
    return { ok: false as const, error: "too-many" as const };
  }
  if (!verifyHash(code, row.code_hash)) {
    await db().sql`UPDATE email_verification_codes SET attempts = attempts + 1 WHERE id = ${row.id}`;
    return { ok: false as const, error: "mismatch" as const, attemptsLeft: 5 - (row.attempts + 1) };
  }

  await db().sql`UPDATE students SET email_verified = TRUE WHERE id = ${session.studentId}`;
  await refreshStudentClaims({ emailVerified: true });
  return { ok: true as const };
}

export async function signIn(input: { email: string; password: string; remember: boolean }) {
  const email = input.email.trim().toLowerCase();
  const rows = await db().sql`SELECT * FROM students WHERE email = ${email}`;
  const student = rows[0] as StudentRow | undefined;

  // Never reveal whether the address exists.
  if (!student) return { ok: false as const, kind: "invalid" as const };

  if (student.suspended) {
    return { ok: false as const, kind: "suspended" as const };
  }

  if (student.locked_until && new Date(student.locked_until) > new Date()) {
    const seconds = Math.ceil((new Date(student.locked_until).getTime() - Date.now()) / 1000);
    return { ok: false as const, kind: "locked" as const, seconds };
  }

  if (!verifyPassword(input.password, student.password_hash)) {
    const attempts = student.failed_login_attempts + 1;
    if (attempts >= MAX_ATTEMPTS) {
      const lockedUntil = new Date(Date.now() + LOCKOUT_SECONDS * 1000);
      await db().sql`
        UPDATE students SET failed_login_attempts = 0, locked_until = ${lockedUntil.toISOString()}
        WHERE id = ${student.id}
      `;
      return { ok: false as const, kind: "locked" as const, seconds: LOCKOUT_SECONDS };
    }
    await db().sql`UPDATE students SET failed_login_attempts = ${attempts} WHERE id = ${student.id}`;
    return { ok: false as const, kind: "wrong-password" as const, attemptsLeft: MAX_ATTEMPTS - attempts };
  }

  await db().sql`
    UPDATE students SET failed_login_attempts = 0, locked_until = NULL WHERE id = ${student.id}
  `;

  const activeSessions = await countActiveStudentSessions(student.id);
  if (activeSessions >= DEVICE_LIMIT) {
    await createPendingStudentCookie(student.id);
    return { ok: false as const, kind: "device-limit" as const };
  }

  const userAgent = (await headers()).get("user-agent");
  await createStudentSession(
    student.id,
    { emailVerified: student.email_verified, onboardingStep: student.onboarding_step },
    { rememberDays: input.remember ? 30 : 1, userAgent },
  );

  return {
    ok: true as const,
    emailVerified: student.email_verified,
    onboardingStep: student.onboarding_step,
  };
}

export async function getPendingDevices() {
  const studentId = await getPendingStudentId();
  if (!studentId) return null;
  const sessions = await listActiveStudentSessions(studentId);
  return { sessions };
}

export async function signOutDevice(sessionId: string) {
  const studentId = await getPendingStudentId();
  if (!studentId) return { ok: false as const };
  await deleteStudentSession(sessionId, studentId);
  return { ok: true as const };
}

export async function finishSignInAfterDeviceLimit() {
  const studentId = await getPendingStudentId();
  if (!studentId) return { ok: false as const };

  const rows = await db().sql`
    SELECT email_verified, onboarding_step FROM students WHERE id = ${studentId}
  `;
  const row = rows[0] as { email_verified: boolean; onboarding_step: string } | undefined;
  if (!row) return { ok: false as const };

  await createStudentSession(studentId, {
    emailVerified: row.email_verified,
    onboardingStep: row.onboarding_step,
  });
  await clearPendingStudentCookie();
  return { ok: true as const };
}

export async function requestPasswordReset(email: string) {
  const normalized = email.trim().toLowerCase();
  const rows = await db().sql`SELECT id FROM students WHERE email = ${normalized}`;
  const student = rows[0] as { id: number } | undefined;

  if (student) {
    const token = randomToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await db().sql`
      INSERT INTO password_reset_tokens (kind, subject_id, token_hash, expires_at)
      VALUES ('student', ${student.id}, ${sha256Hex(token)}, ${expiresAt.toISOString()})
    `;
    await sendPasswordResetEmail(normalized, `${appUrl()}/reset-password?token=${token}`);
  }

  // Always the same outcome — must not confirm registration either way.
  return { ok: true as const };
}

export async function resetPassword(token: string, password: string) {
  const rows = await db().sql`
    SELECT id, subject_id, expires_at, used_at FROM password_reset_tokens
    WHERE token_hash = ${sha256Hex(token)} AND kind = 'student'
  `;
  const row = rows[0] as
    | { id: number; subject_id: number; expires_at: string; used_at: string | null }
    | undefined;

  if (!row || row.used_at || new Date(row.expires_at) < new Date()) {
    return { ok: false as const };
  }

  const passwordHash = hashPassword(password);
  await db().sql`UPDATE students SET password_hash = ${passwordHash} WHERE id = ${row.subject_id}`;
  await db().sql`UPDATE password_reset_tokens SET used_at = NOW() WHERE id = ${row.id}`;
  // Copy states every other session was ended — make that real.
  await db().sql`DELETE FROM sessions WHERE kind = 'student' AND subject_id = ${row.subject_id}`;

  return { ok: true as const };
}

export async function setOnboardingStep(step: string) {
  const session = await verifyStudentSession();
  await db().sql`UPDATE students SET onboarding_step = ${step} WHERE id = ${session.studentId}`;
  await refreshStudentClaims({ onboardingStep: step });
  return { ok: true as const };
}

export async function signOutStudent() {
  await destroyStudentSession();
  return { ok: true as const };
}

/** The onboarding level step's self-assessment — not test-confirmed, so
 * the dashboard still offers the real placement test. */
export async function setSelfReportedLevel(level: string | null) {
  const session = await verifyStudentSession();
  await db().sql`
    UPDATE students SET level = ${level}, level_source = ${level ? "self" : null}
    WHERE id = ${session.studentId}
  `;
  return { ok: true as const };
}

export async function setPlanStatus(status: "free" | "premium") {
  const session = await verifyStudentSession();
  await db().sql`UPDATE students SET plan_status = ${status} WHERE id = ${session.studentId}`;
  return { ok: true as const };
}

export async function getPlacementQuestions() {
  await verifyStudentSession();
  return getPublicQuestions();
}

export async function submitPlacementTest(answers: Record<string, number>) {
  const session = await verifyStudentSession();
  const result = scorePlacementTest(answers);

  await db().sql`
    INSERT INTO placement_test_attempts (student_id, score, total, result_level, answers)
    VALUES (${session.studentId}, ${result.score}, ${result.total}, ${result.level}, ${JSON.stringify(answers)})
  `;
  await db().sql`
    UPDATE students SET level = ${result.level}, level_source = 'test' WHERE id = ${session.studentId}
  `;

  return { ok: true as const, ...result };
}
