"use server";

import { db } from "@/lib/db";
import { hashPassword, randomRecoveryCode, sha256Hex, verifyHash, verifyPassword } from "@/lib/crypto";
import { generateTotpSecret, totpQrDataUrl, verifyTotpCode } from "@/lib/totp";
import { verifyAdminSession } from "@/lib/dal";
import { createAdminSession, destroyAdminSession, getAdminClaims, markAdminSessionVerified } from "@/lib/session";

const LOCKOUT_SECONDS = 15 * 60;
const MAX_ATTEMPTS = 3;
const RECOVERY_CODE_COUNT = 8;

interface AdminRow {
  id: number;
  password_hash: string;
  totp_secret: string | null;
  totp_enrolled_at: string | null;
  failed_login_attempts: number;
  locked_until: string | null;
}

async function registerFailure(adminId: number, currentAttempts: number) {
  const attempts = currentAttempts + 1;
  if (attempts >= MAX_ATTEMPTS) {
    const lockedUntil = new Date(Date.now() + LOCKOUT_SECONDS * 1000);
    await db().sql`
      UPDATE admin_users SET failed_login_attempts = 0, locked_until = ${lockedUntil.toISOString()}
      WHERE id = ${adminId}
    `;
    return { locked: true as const, seconds: LOCKOUT_SECONDS };
  }
  await db().sql`UPDATE admin_users SET failed_login_attempts = ${attempts} WHERE id = ${adminId}`;
  return { locked: false as const, attemptsLeft: MAX_ATTEMPTS - attempts };
}

export async function adminSignIn(input: { email: string; password: string }) {
  const email = input.email.trim().toLowerCase();
  const rows = await db().sql`SELECT * FROM admin_users WHERE email = ${email}`;
  const admin = rows[0] as AdminRow | undefined;

  if (!admin) return { ok: false as const, kind: "invalid" as const };

  if (admin.locked_until && new Date(admin.locked_until) > new Date()) {
    const seconds = Math.ceil((new Date(admin.locked_until).getTime() - Date.now()) / 1000);
    return { ok: false as const, kind: "locked" as const, seconds };
  }

  if (!verifyPassword(input.password, admin.password_hash)) {
    const result = await registerFailure(admin.id, admin.failed_login_attempts);
    if (result.locked) return { ok: false as const, kind: "locked" as const, seconds: result.seconds };
    return { ok: false as const, kind: "invalid" as const, attemptsLeft: result.attemptsLeft };
  }

  await db().sql`UPDATE admin_users SET failed_login_attempts = 0, locked_until = NULL WHERE id = ${admin.id}`;
  await createAdminSession(admin.id, false);

  return { ok: true as const, needsSetup: !admin.totp_enrolled_at };
}

/** Idempotent — reuses an unconfirmed secret rather than invalidating a QR
 * the admin may have already scanned. */
export async function getOrCreateTotpSetup() {
  const session = await verifyAdminSession({ requireTwoFactor: false });
  const rows = await db().sql`
    SELECT totp_secret, totp_enrolled_at FROM admin_users WHERE id = ${session.adminId}
  `;
  const row = rows[0] as { totp_secret: string | null; totp_enrolled_at: string | null };

  if (row.totp_enrolled_at) {
    return { alreadyEnrolled: true as const };
  }

  const secret = row.totp_secret ?? generateTotpSecret();
  if (!row.totp_secret) {
    await db().sql`UPDATE admin_users SET totp_secret = ${secret} WHERE id = ${session.adminId}`;
  }

  const qrDataUrl = await totpQrDataUrl(secret, session.email);
  return { alreadyEnrolled: false as const, secret, qrDataUrl };
}

export async function confirmTotpSetup(code: string) {
  const session = await verifyAdminSession({ requireTwoFactor: false });
  const rows = await db().sql`SELECT totp_secret FROM admin_users WHERE id = ${session.adminId}`;
  const row = rows[0] as { totp_secret: string | null } | undefined;

  if (!row?.totp_secret || !verifyTotpCode(row.totp_secret, code)) {
    return { ok: false as const };
  }

  await db().sql`UPDATE admin_users SET totp_enrolled_at = NOW() WHERE id = ${session.adminId}`;

  const codes = Array.from({ length: RECOVERY_CODE_COUNT }, () => randomRecoveryCode());
  for (const plain of codes) {
    await db().sql`
      INSERT INTO admin_recovery_codes (admin_id, code_hash) VALUES (${session.adminId}, ${sha256Hex(plain)})
    `;
  }

  await markAdminSessionVerified();
  return { ok: true as const, recoveryCodes: codes };
}

export async function verifyTwoFactorCode(code: string) {
  const claims = await getAdminClaims();
  if (!claims) return { ok: false as const, kind: "no-session" as const };

  const rows = await db().sql`
    SELECT totp_secret, failed_login_attempts FROM admin_users WHERE id = ${claims.adminId}
  `;
  const admin = rows[0] as { totp_secret: string | null; failed_login_attempts: number } | undefined;
  if (!admin?.totp_secret) return { ok: false as const, kind: "no-session" as const };

  if (!verifyTotpCode(admin.totp_secret, code)) {
    const result = await registerFailure(claims.adminId, admin.failed_login_attempts);
    if (result.locked) return { ok: false as const, kind: "locked" as const, seconds: result.seconds };
    return { ok: false as const, kind: "mismatch" as const, attemptsLeft: result.attemptsLeft };
  }

  await db().sql`UPDATE admin_users SET failed_login_attempts = 0, locked_until = NULL WHERE id = ${claims.adminId}`;
  await markAdminSessionVerified();
  return { ok: true as const };
}

export async function verifyRecoveryCode(code: string) {
  const claims = await getAdminClaims();
  if (!claims) return { ok: false as const, kind: "no-session" as const };

  const rows = await db().sql`
    SELECT id, code_hash FROM admin_recovery_codes WHERE admin_id = ${claims.adminId} AND used_at IS NULL
  `;
  const match = (rows as { id: number; code_hash: string }[]).find((row) =>
    verifyHash(code.trim().toUpperCase(), row.code_hash),
  );

  if (!match) return { ok: false as const, kind: "mismatch" as const };

  await db().sql`UPDATE admin_recovery_codes SET used_at = NOW() WHERE id = ${match.id}`;
  await markAdminSessionVerified();
  return { ok: true as const };
}

export async function remainingRecoveryCodeCount() {
  const claims = await getAdminClaims();
  if (!claims) return 0;
  const rows = await db().sql`
    SELECT COUNT(*)::int AS count FROM admin_recovery_codes
    WHERE admin_id = ${claims.adminId} AND used_at IS NULL
  `;
  return (rows[0]?.count as number) ?? 0;
}

export async function getInviteEmail(token: string) {
  const rows = await db().sql`
    SELECT email, expires_at, used_at FROM admin_invites WHERE token_hash = ${sha256Hex(token)}
  `;
  const invite = rows[0] as { email: string; expires_at: string; used_at: string | null } | undefined;
  if (!invite || invite.used_at || new Date(invite.expires_at) < new Date()) {
    return { ok: false as const };
  }
  return { ok: true as const, email: invite.email };
}

export async function acceptAdminInvite(token: string, password: string) {
  const rows = await db().sql`
    SELECT id, email, expires_at, used_at FROM admin_invites WHERE token_hash = ${sha256Hex(token)}
  `;
  const invite = rows[0] as
    | { id: number; email: string; expires_at: string; used_at: string | null }
    | undefined;

  if (!invite || invite.used_at || new Date(invite.expires_at) < new Date()) {
    return { ok: false as const };
  }

  const passwordHash = hashPassword(password);
  const adminRows = await db().sql`
    INSERT INTO admin_users (email, password_hash) VALUES (${invite.email}, ${passwordHash})
    ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
    RETURNING id
  `;
  const adminId = (adminRows[0] as { id: number }).id;

  await db().sql`UPDATE admin_invites SET used_at = NOW() WHERE id = ${invite.id}`;
  await createAdminSession(adminId, false);

  return { ok: true as const, email: invite.email };
}

export async function getTwoFactorEnrollment() {
  const session = await verifyAdminSession({ requireTwoFactor: false });
  const rows = await db().sql`
    SELECT totp_enrolled_at FROM admin_users WHERE id = ${session.adminId}
  `;
  const row = rows[0] as { totp_enrolled_at: string | null } | undefined;
  return { enrolled: Boolean(row?.totp_enrolled_at) };
}

export async function adminSignOut() {
  await destroyAdminSession();
  return { ok: true as const };
}
