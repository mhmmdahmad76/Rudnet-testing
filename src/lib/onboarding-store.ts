// No backend — onboarding answers live in localStorage so "Back returns to
// the previous step with answers intact" actually works, and the Ready
// screen can summarize every choice.

export interface OnboardingAnswers {
  level?: string;
  goals?: string[];
  pace?: "2" | "4" | "6";
  reminders?: boolean;
  plan?: "monthly" | "annual";
  paymentMethod?: "card" | "transfer";
}

const KEY = "lisaan_onboarding_answers";

export function getOnboardingAnswers(): OnboardingAnswers {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}") as OnboardingAnswers;
  } catch {
    return {};
  }
}

export function setOnboardingAnswers(patch: Partial<OnboardingAnswers>) {
  const current = getOnboardingAnswers();
  localStorage.setItem(KEY, JSON.stringify({ ...current, ...patch }));
}
