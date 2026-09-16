"use client";

import { useEffect } from "react";

// Reference-counted body scroll lock so nested overlays (mobile menu + picker
// dialog) never re-enable scrolling underneath a still-open layer.
let locks = 0;
let previousOverflow = "";

export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    if (locks === 0) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    locks += 1;
    return () => {
      locks -= 1;
      if (locks === 0) document.body.style.overflow = previousOverflow;
    };
  }, [active]);
}
