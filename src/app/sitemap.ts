import type { MetadataRoute } from "next";
import { vehicles } from "@/data/vehicles";
import { articles } from "@/data/news";
import { SITE_URL } from "@/lib/utils";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "/", priority: 1, changeFrequency: "daily" },
    { path: "/vehicles", priority: 0.9, changeFrequency: "weekly" },
    { path: "/compare", priority: 0.7, changeFrequency: "weekly" },
    { path: "/connect", priority: 0.8, changeFrequency: "weekly" },
    { path: "/connect/trip-planner", priority: 0.7, changeFrequency: "monthly" },
    { path: "/connect/ecosystem", priority: 0.6, changeFrequency: "monthly" },
    { path: "/connect/ota", priority: 0.6, changeFrequency: "weekly" },
    { path: "/charging", priority: 0.8, changeFrequency: "weekly" },
    { path: "/atelier", priority: 0.8, changeFrequency: "monthly" },
    { path: "/test-drive", priority: 0.7, changeFrequency: "monthly" },
    { path: "/trade-in", priority: 0.6, changeFrequency: "monthly" },
    { path: "/service", priority: 0.6, changeFrequency: "monthly" },
    { path: "/news", priority: 0.7, changeFrequency: "daily" },
    { path: "/stores", priority: 0.6, changeFrequency: "monthly" },
    { path: "/support", priority: 0.6, changeFrequency: "monthly" },
    { path: "/legal/privacy", priority: 0.3, changeFrequency: "yearly" },
    { path: "/legal/terms", priority: 0.3, changeFrequency: "yearly" },
  ];
  return [
    ...staticRoutes.map((r) => ({ url: `${SITE_URL}${r.path}`, lastModified: now, changeFrequency: r.changeFrequency, priority: r.priority })),
    ...vehicles.map((v) => ({ url: `${SITE_URL}/vehicles/${v.slug}`, lastModified: new Date(v.launchDate > "2026-09-15" ? "2026-09-15" : v.launchDate), changeFrequency: "weekly" as const, priority: 0.9 })),
    ...articles.map((a) => ({ url: `${SITE_URL}/news/${a.slug}`, lastModified: new Date(a.date), changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
