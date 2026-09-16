/** WCAG 2.2 relative-luminance and contrast helpers for design-token tests. */

export function hexToRgb(hex: string): [number, number, number] {
  const raw = hex.replace("#", "").trim();
  const full = raw.length === 3 ? raw.split("").map((c) => c + c).join("") : raw;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  const n = Number.parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function linearize(channel: number): number {
  const s = channel / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

export function contrastRatio(foreground: string, background: string): number {
  const a = relativeLuminance(foreground);
  const b = relativeLuminance(background);
  const lighter = Math.max(a, b);
  const darker = Math.min(a, b);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Palette copied from `src/app/globals.css` `@theme`.
 * Keep in lockstep — the contrast test fails if tokens regress below AA.
 */
export const palette = {
  ink: "#171a20",
  graphite: "#2c2f35",
  slate: "#4a4d53",
  ash: "#63666b",
  fog: "#e8eaed",
  dusk: "#c8cbd0",
  mist: "#ededf0",
  cloud: "#f5f5f7",
  white: "#ffffff",
  carbon: "#0b0c0e",
  miDeep: "#a63f00",
  atelierDeep: "#7a5a22",
  teslaDeep: "#b91c1c",
  successDeep: "#137038",
} as const;
