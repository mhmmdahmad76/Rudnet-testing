/**
 * There is no backend behind this build — these are demo session cookies
 * so the routing rules in BUILD.md §8 are actually testable end to end.
 * A real backend would replace this with real sessions; the middleware
 * rules themselves are written to match the spec regardless.
 */
export const SESSION_COOKIE = "lisaan_session";
export const VERIFIED_COOKIE = "lisaan_verified";
export const ONBOARDING_STEP_COOKIE = "lisaan_onboarding_step";
export const NAME_COOKIE = "lisaan_name";
export const EMAIL_COOKIE = "lisaan_email";

export const ADMIN_SESSION_COOKIE = "lisaan_admin_session";
export const ADMIN_2FA_COOKIE = "lisaan_admin_2fa";

export const ONBOARDING_STEPS = ["level", "goal", "pace", "plan"] as const;
export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

export function setDemoCookie(name: string, value: string, days = 30) {
  document.cookie = `${name}=${value}; path=/; max-age=${days * 86400}; samesite=lax`;
}

export function clearDemoCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0`;
}
