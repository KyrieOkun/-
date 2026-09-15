"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getDictionary, type Dictionary } from "./index";
import { pick as pickL10n, type L10n, type Locale } from "./types";

interface I18nContextValue {
  locale: Locale;
  t: Dictionary;
  pick: (text: L10n | string | undefined) => string;
  setLocale: (locale: Locale) => Promise<void>;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  const router = useRouter();
  const setLocale = useCallback(
    async (next: Locale) => {
      await fetch("/api/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: next }),
      });
      router.refresh();
    },
    [router],
  );

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      t: getDictionary(locale),
      pick: (text) => pickL10n(text, locale),
      setLocale,
    }),
    [locale, setLocale],
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
