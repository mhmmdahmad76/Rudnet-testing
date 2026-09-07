import "server-only";
import { randomBytes, randomInt, scryptSync, timingSafeEqual, createHash } from "node:crypto";

const SCRYPT_KEYLEN = 64;

/** `scrypt:<saltHex>:<hashHex>` — no external dependency, no native bindings. */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, SCRYPT_KEYLEN).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, salt, hashHex] = stored.split(":");
  if (scheme !== "scrypt" || !salt || !hashHex) return false;
  const candidate = scryptSync(password, salt, SCRYPT_KEYLEN);
  const expected = Buffer.from(hashHex, "hex");
  if (candidate.length !== expected.length) return false;
  return timingSafeEqual(candidate, expected);
}

/** For one-time codes/tokens: fast, constant-time compare against a stored hash. */
export function sha256Hex(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

export function verifyHash(input: string, storedHex: string): boolean {
  const candidate = Buffer.from(sha256Hex(input), "hex");
  const expected = Buffer.from(storedHex, "hex");
  if (candidate.length !== expected.length) return false;
  return timingSafeEqual(candidate, expected);
}

/** A 6-digit numeric code for email verification, zero-padded. */
export function randomDigitCode(digits = 6): string {
  return String(randomInt(0, 10 ** digits)).padStart(digits, "0");
}

/** A URL-safe opaque token for session ids, invite/reset links. */
export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

/** A recovery code: groups of uppercase alphanumerics, easy to transcribe. */
export function randomRecoveryCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I
  let out = "";
  for (let i = 0; i < 10; i++) {
    if (i > 0 && i % 5 === 0) out += "-";
    out += alphabet[randomInt(0, alphabet.length)];
  }
  return out;
}
