export const LOCALES = ["zh", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "zh";
export const LOCALE_COOKIE = "mta_locale";

export interface L10n {
  zh: string;
  en: string;
}

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

export function pick(text: L10n | string | undefined, locale: Locale): string {
  if (text === undefined) return "";
  if (typeof text === "string") return text;
  return text[locale] ?? text.zh;
}

export function l(zh: string, en: string): L10n {
  return { zh, en };
}
