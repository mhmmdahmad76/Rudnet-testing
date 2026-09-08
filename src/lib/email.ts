import "server-only";
import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;

async function sendEmail(to: string, subject: string, html: string) {
  if (!resend) {
    // RESEND_API_KEY isn't set — this is the only place that's allowed to
    // still behave like a demo. Everything else in this file is real.
    console.warn(`[email] RESEND_API_KEY not set — not sent. To: ${to} — ${subject}`);
    console.warn(html.replace(/<[^>]+>/g, " ").trim());
    return;
  }
  const from = process.env.RESEND_FROM_EMAIL;
  if (!from) throw new Error("RESEND_API_KEY is set but RESEND_FROM_EMAIL is not.");

  const { error } = await resend.emails.send({ from, to, subject, html });
  if (error) throw new Error(`Resend failed to send to ${to}: ${error.message}`);
}

export async function sendVerificationEmail(to: string, code: string) {
  await sendEmail(
    to,
    "Your Lisaan verification code",
    `<p>Your 6-digit code is <strong style="font-size:20px;letter-spacing:2px">${code}</strong>.</p>
     <p>It expires in 10 minutes. If you didn't request this, you can ignore this email.</p>`,
  );
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  await sendEmail(
    to,
    "Reset your Lisaan password",
    `<p>Someone requested a password reset for this address.</p>
     <p><a href="${resetUrl}">Reset your password</a> — this link works once and expires in one hour.</p>
     <p>If you didn't request this, you can ignore this email — your password hasn't changed.</p>`,
  );
}
