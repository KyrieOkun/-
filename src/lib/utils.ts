import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Locale } from "@/lib/i18n/types";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Formats a CNY amount, e.g. 219900 → "¥219,900". */
export function formatCNY(amount: number, options: { compact?: boolean; locale?: Locale } = {}): string {
  const { compact = false, locale = "zh" } = options;
  if (compact && Math.abs(amount) >= 10_000) {
    const wan = amount / 10_000;
    const text = Number.isInteger(wan) ? wan.toFixed(0) : wan.toFixed(2).replace(/\.?0+$/, "");
    return locale === "zh" ? `${text} 万元` : `¥${text}0K`.replace("0K", "0k");
  }
  return `¥${Math.round(amount).toLocaleString("en-US")}`;
}

/** Formats a price in 万 for headline use, e.g. 219900 → "21.99 万" / "¥219,900". */
export function formatPriceHeadline(amount: number, locale: Locale): string {
  if (locale === "zh") {
    const wan = amount / 10_000;
    const text = wan.toFixed(2).replace(/\.?0+$/, "");
    return `${text} 万元`;
  }
  return `¥${Math.round(amount).toLocaleString("en-US")}`;
}

export function formatUSD(amount: number): string {
  return `$${Math.round(amount).toLocaleString("en-US")}`;
}

export function formatNumber(value: number, locale: Locale = "zh", fractionDigits = 0): string {
  return value.toLocaleString(locale === "zh" ? "zh-CN" : "en-US", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

export function formatDate(iso: string, locale: Locale = "zh"): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateTime(iso: string, locale: Locale = "zh"): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(locale === "zh" ? "zh-CN" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Deterministic 32-bit hash for seeding pseudo-random but stable values. */
export function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function seededRandom(seed: number): () => number {
  let s = seed || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export function isValidCNPhone(value: string): boolean {
  return /^1[3-9]\d{9}$/.test(value.replace(/\s|-/g, ""));
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

export function maskPhone(phone: string): string {
  return phone.replace(/^(\d{3})\d{4}(\d{4})$/, "$1****$2");
}

export function generateId(prefix: string): string {
  const time = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${time}-${rand}`;
}

// Only read on the server (metadata, sitemap, robots, JSON-LD). `SITE_URL` is a
// runtime variable so Docker images can be pointed at a domain without rebuilding;
// `NEXT_PUBLIC_SITE_URL` is inlined at build time and kept as a fallback.
export const SITE_URL = (process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "https://mitesla-atelier.com").replace(/\/$/, "");

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
