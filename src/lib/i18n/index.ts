import { zh, type Dictionary } from "./dictionaries/zh";
import { en } from "./dictionaries/en";
import { DEFAULT_LOCALE, type Locale } from "./types";

export * from "./types";
export type { Dictionary };

const dictionaries: Record<Locale, Dictionary> = { zh, en };

export function getDictionary(locale: Locale = DEFAULT_LOCALE): Dictionary {
  return dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
}

export function localeToLang(locale: Locale): string {
  return locale === "zh" ? "zh-CN" : "en";
}
