import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "小米汽车 × 特斯拉 高级定制 · MI × TESLA ATELIER",
    short_name: "MI×TESLA",
    description: "小米汽车 × 特斯拉 官方联名高级定制中心",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#171a20",
    lang: "zh-CN",
    orientation: "portrait",
    categories: ["shopping", "lifestyle", "utilities"],
    icons: [
      { src: "/icons/192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/512?maskable=1", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "车型", url: "/vehicles" },
      { name: "我的车库", url: "/connect/garage" },
      { name: "充电", url: "/charging" },
    ],
  };
}
