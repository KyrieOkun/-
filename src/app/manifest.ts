import type { MetadataRoute } from "next";
import { getLocale } from "@/lib/i18n/server";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const locale = await getLocale();
  const zh = locale === "zh";
  return {
    id: "/",
    name: zh ? "小米汽车 × 特斯拉 高级定制 · MI × TESLA ATELIER" : "MI × TESLA ATELIER — Xiaomi EV × Tesla bespoke",
    short_name: "MI×TESLA",
    description: zh ? "小米汽车 × 特斯拉 官方联名高级定制中心" : "The official Xiaomi EV × Tesla bespoke atelier",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#171a20",
    lang: zh ? "zh-CN" : "en",
    orientation: "portrait",
    categories: ["shopping", "lifestyle", "utilities"],
    icons: [
      { src: "/icons/192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/512?maskable=1", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: zh ? "车型" : "Vehicles", url: "/vehicles" },
      { name: zh ? "我的车库" : "My garage", url: "/connect/garage" },
      { name: zh ? "充电" : "Charging", url: "/charging" },
    ],
  };
}
