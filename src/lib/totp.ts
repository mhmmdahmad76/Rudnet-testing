import "server-only";
import * as OTPAuth from "otpauth";
import QRCode from "qrcode";

const ISSUER = "Lisaan Admin";

export function generateTotpSecret(): string {
  return new OTPAuth.Secret({ size: 20 }).base32;
}

function totp(secret: string, label: string) {
  return new OTPAuth.TOTP({
    issuer: ISSUER,
    label,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secret),
  });
}

/** RFC 6238 verification, ±1 step (30s) to tolerate clock drift. */
export function verifyTotpCode(secret: string, code: string): boolean {
  const delta = totp(secret, "").validate({ token: code.trim(), window: 1 });
  return delta !== null;
}

/** A data: URL PNG of the enrollment QR — scan into any authenticator app. */
export async function totpQrDataUrl(secret: string, email: string): Promise<string> {
  const uri = totp(secret, email).toString();
  return QRCode.toDataURL(uri, { margin: 1, width: 240 });
}
