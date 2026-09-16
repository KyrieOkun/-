"use client";

import { createContext, useCallback, useContext, useMemo, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { Dictionary } from "./dictionaries/zh";
import { pick as pickL10n, type L10n, type Locale } from "./types";

interface I18nContextValue {
  locale: Locale;
  t: Dictionary;
  pick: (text: L10n | string | undefined) => string;
  setLocale: (locale: Locale) => Promise<void>;
  /** True while the server re-renders with the new locale. */
  switching: boolean;
}

const I18nContext = createContext<I18nContextValue | null>(null);

/** `dictionary` is resolved on the server so only the active language ships to the browser. */
export function LocaleProvider({ locale, dictionary, children }: { locale: Locale; dictionary: Dictionary; children: ReactNode }) {
  const router = useRouter();
  const [switching, startTransition] = useTransition();
  const setLocale = useCallback(
    async (next: Locale) => {
      if (next === locale) return;
      await fetch("/api/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: next }),
      });
      startTransition(() => router.refresh());
    },
    [router, locale],
  );

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      t: dictionary,
      pick: (text) => pickL10n(text, locale),
      setLocale,
      switching,
    }),
    [locale, dictionary, setLocale, switching],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within <LocaleProvider>");
  }
  return ctx;
}
