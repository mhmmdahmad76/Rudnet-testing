export type Locale = "en" | "ar";

export const LOCALE_COOKIE = "lisaan_locale";
export const DEFAULT_LOCALE: Locale = "en";

export function dirFor(locale: Locale): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}

export function isLocale(value: string | undefined): value is Locale {
  return value === "en" || value === "ar";
}
