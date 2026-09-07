// Zero-dependency constants and types shared between lib/session.ts (which
// touches the database and must never load in an edge bundle) and proxy.ts
// (which Netlify's Next.js Runtime deploys as an Edge Function — pulling in
// @netlify/database's Node `pg` driver there would break the build/runtime).
// Keep this file free of any imports.

export const STUDENT_COOKIE = "lisaan_session";
export const ADMIN_COOKIE = "lisaan_admin_session";

export interface StudentClaims {
  kind: "student";
  sid: string;
  studentId: number;
  emailVerified: boolean;
  onboardingStep: string;
}

export interface AdminClaims {
  kind: "admin";
  sid: string;
  adminId: number;
  twoFactorVerified: boolean;
}
