"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type HeaderMode = "overlay" | "overlay-dark" | "solid";

const HeaderThemeContext = createContext<{ mode: HeaderMode; setMode: (m: HeaderMode) => void }>({
  mode: "solid",
  setMode: () => {},
});

export function HeaderThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<HeaderMode>("solid");
  return <HeaderThemeContext.Provider value={{ mode, setMode }}>{children}</HeaderThemeContext.Provider>;
}

export function useHeaderTheme() {
  return useContext(HeaderThemeContext);
}

/**
 * Drop this into any page whose top section is a full-bleed hero. The header
 * becomes transparent until the user scrolls; `tone="light"` keeps dark text
 * for bright imagery.
 */
export function HeroOverlay({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const { setMode } = useHeaderTheme();
  useEffect(() => {
    setMode(tone === "light" ? "overlay-dark" : "overlay");
    return () => setMode("solid");
  }, [setMode, tone]);
  return null;
}
