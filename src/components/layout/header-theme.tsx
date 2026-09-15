"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type HeaderMode = "overlay" | "solid";

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
 * Drop this into any page whose top section is a full-bleed dark hero.
 * The header becomes transparent (white text) until the user scrolls.
 */
export function HeroOverlay() {
  const { setMode } = useHeaderTheme();
  useEffect(() => {
    setMode("overlay");
    return () => setMode("solid");
  }, [setMode]);
  return null;
}
