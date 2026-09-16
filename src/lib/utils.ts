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
    if (locale === "zh") return `${text} 万元`;
    const thousands = amount / 1_000;
    return `¥${(Number.isInteger(thousands) ? thousands.toFixed(0) : thousands.toFixed(1).replace(/\.0$/, ""))}k`;
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

/** Date-only ISO strings are calendar dates: parse them in local time so they never shift a day across time zones. */
function parseIso(iso: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(iso);
}

/** All customer-facing timestamps are shown in China Standard Time, on the server and in the browser alike (no hydration drift). */
export const SITE_TIME_ZONE = "Asia/Shanghai";

export function formatDate(iso: string, locale: Locale = "zh"): string {
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(iso);
  const d = parseIso(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    // Calendar dates were parsed in local time; instants are shown in CST.
    ...(dateOnly ? {} : { timeZone: SITE_TIME_ZONE }),
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
    hour12: false,
    timeZone: SITE_TIME_ZONE,
  });
}

/** YYYY-MM-DD for "today + n days" in China Standard Time; identical on server and client. */
export function isoDateInCST(daysFromNow = 0): string {
  const d = new Date(Date.now() + daysFromNow * 86_400_000);
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: SITE_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(d);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
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

/** Strips spaces, hyphens and a +86 prefix so the same number always indexes the same way. */
export function normalizePhone(value: string): string {
  return value.trim().replace(/\s|-/g, "").replace(/^(\+?86)(?=1[3-9]\d{9}$)/, "");
}

export function isValidCNPhone(value: string): boolean {
  return /^1[3-9]\d{9}$/.test(normalizePhone(value));
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

export function maskPhone(phone: string): string {
  const digits = normalizePhone(phone);
  return digits.length === 11 ? digits.replace(/^(\d{3})\d{4}(\d{4})$/, "$1****$2") : phone.replace(/.(?=.{4})/g, "*");
}

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I to avoid misreads

/** Cryptographically random human-readable code (works in Node and browsers). */
export function secureCode(length: number): string {
  const bytes = new Uint8Array(length);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join("");
}

export function generateId(prefix: string): string {
  const time = Date.now().toString(36).toUpperCase();
  return `${prefix}-${time}-${secureCode(6)}`;
}

// Only read on the server (metadata, sitemap, robots, JSON-LD). `SITE_URL` is a
// runtime variable so Docker images can be pointed at a domain without rebuilding;
// `NEXT_PUBLIC_SITE_URL` is inlined at build time and kept as a fallback.
export const SITE_URL = (process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "https://mitesla-atelier.com").replace(/\/$/, "");

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
