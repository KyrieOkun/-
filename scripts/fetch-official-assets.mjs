#!/usr/bin/env node
/**
 * Downloads the official vehicle imagery used across the site from the two
 * brands' public asset CDNs (xiaomiev.com / digitalassets.tesla.com), resizes
 * to a web-friendly width and writes optimised JPEGs into public/images.
 *
 *   node scripts/fetch-official-assets.mjs            # fetch missing files
 *   node scripts/fetch-official-assets.mjs --force    # re-download everything
 *
 * The manifest below is the single source of truth for which official asset
 * backs which vehicle / paint / wheel / interior image.
 */
import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public", "images");
const FORCE = process.argv.includes("--force");

const X = "https://s1.xiaomiev.com/activity-outer-assets/0328/images";
const T = "https://digitalassets.tesla.com/tesla-contents/image/upload/f_auto,q_auto";
const xi = (p) => `${X}/${p}?x-fds-process=image/resize,w_2000`;
const te = (n) => `${T}/${n}`;

/** @type {Array<{ out: string; url: string; width?: number; quality?: number }>} */
const manifest = [
  // ─── Xiaomi SU7 (2026 new generation) ────────────────────────────────
  { out: "vehicles/xiaomi-su7/hero.jpg", url: xi("su7_20260319/pc/27-1.png") },
  { out: "vehicles/xiaomi-su7/interior.jpg", url: xi("su7_20260319/pc/9-1.png") },
  { out: "vehicles/xiaomi-su7/scene.jpg", url: xi("su7_20260319/pc/2-1.png") },
  { out: "vehicles/xiaomi-su7/paints/capri-blue.jpg", url: xi("su7_20260319/pc/6-1.png") },
  { out: "vehicles/xiaomi-su7/paints/chixia-red.jpg", url: xi("su7_20260319/pc/6-2.png") },
  { out: "vehicles/xiaomi-su7/paints/indigo-green.jpg", url: xi("su7_20260319/pc/6-3.png") },
  { out: "vehicles/xiaomi-su7/paints/aurora-purple.jpg", url: xi("su7_20260319/pc/6-4.png") },
  { out: "vehicles/xiaomi-su7/paints/elegant-grey.jpg", url: xi("su7_20260319/pc/6-6.png") },
  { out: "vehicles/xiaomi-su7/paints/pearl-white.jpg", url: xi("su7_20260319/pc/6-7.png") },
  { out: "vehicles/xiaomi-su7/paints/gold-pink.jpg", url: xi("su7_20260319/pc/6-8.png") },
  { out: "vehicles/xiaomi-su7/paints/obsidian-black.jpg", url: xi("su7_20260319/pc/6-9.png") },
  { out: "vehicles/xiaomi-su7/interiors/mist-purple.jpg", url: xi("su7_20260319/pc/10-1.png") },
  { out: "vehicles/xiaomi-su7/interiors/sand-beige.jpg", url: xi("su7_20260319/pc/10-2.png") },
  { out: "vehicles/xiaomi-su7/interiors/dusk-red.jpg", url: xi("su7_20260319/pc/10-3.png") },
  { out: "vehicles/xiaomi-su7/interiors/night-black.jpg", url: xi("su7_20260319/pc/10-4.png") },
  { out: "vehicles/xiaomi-su7/wheels/19-diamond.jpg", url: xi("su7_20260319/pc/7-1.png"), width: 900 },
  { out: "vehicles/xiaomi-su7/wheels/20-mi.jpg", url: xi("su7_20260319/pc/7-2.png"), width: 900 },
  { out: "vehicles/xiaomi-su7/wheels/20-plum.jpg", url: xi("su7_20260319/pc/7-3.png"), width: 900 },
  { out: "vehicles/xiaomi-su7/wheels/20-blade.jpg", url: xi("su7_20260430/pc/7-4.png"), width: 900 },
  { out: "vehicles/xiaomi-su7/wheels/21-sport.jpg", url: xi("su7_20260319/pc/7-5.png"), width: 900 },
  { out: "vehicles/xiaomi-su7/wheels/21-forged-plum.jpg", url: xi("su7_20260319/pc/7-6.png"), width: 900 },

  // ─── Xiaomi SU7 Ultra ────────────────────────────────────────────────
  { out: "vehicles/xiaomi-su7-ultra/hero.jpg", url: xi("su7_ultra_20250227/pc/5.jpg") },
  { out: "vehicles/xiaomi-su7-ultra/track.jpg", url: xi("su7_ultra_20250227/pc/24.jpg") },
  { out: "vehicles/xiaomi-su7-ultra/interior.jpg", url: xi("su7_ultra_20250227/pc/13.jpg") },
  { out: "vehicles/xiaomi-su7-ultra/studio.jpg", url: xi("su7_ultra_20250227/pc/32.jpg") },
  { out: "vehicles/xiaomi-su7-ultra/nurburgring-edition.jpg", url: xi("su7_ultra_20250624/pc/5.png") },
  { out: "vehicles/xiaomi-su7-ultra/track-package.jpg", url: xi("su7_ultra_20250624/pc/7.png") },
  { out: "vehicles/xiaomi-su7-ultra/paints/lightning-yellow.jpg", url: xi("su7_ultra_20250227/pc/5.jpg") },
  { out: "vehicles/xiaomi-su7-ultra/paints/space-silver.jpg", url: xi("su7_ultra_20250227/pc/8-1.jpg") },
  { out: "vehicles/xiaomi-su7-ultra/paints/parrot-green.jpg", url: xi("su7_ultra_20250227/pc/8-2.jpg") },
  { out: "vehicles/xiaomi-su7-ultra/paints/pearl-white.jpg", url: xi("su7_ultra_20250227/pc/9-1.jpg") },
  { out: "vehicles/xiaomi-su7-ultra/paints/obsidian-black.jpg", url: xi("su7_ultra_20250227/pc/9-2.jpg") },
  { out: "vehicles/xiaomi-su7-ultra/wheels/21-forged.jpg", url: xi("su7_ultra_20250227/pc/10.jpg"), width: 1200 },
  { out: "vehicles/xiaomi-su7-ultra/interiors/black-alcantara.jpg", url: xi("su7_ultra_20250227/pc/12.jpg") },

  // ─── Xiaomi YU7 (2026 refresh) ───────────────────────────────────────
  { out: "vehicles/xiaomi-yu7/hero.jpg", url: xi("yu7_20250522/pc/4.jpg") },
  { out: "vehicles/xiaomi-yu7/scene.jpg", url: xi("yu7_20250522/pc/3.jpg") },
  { out: "vehicles/xiaomi-yu7/interior.jpg", url: xi("yu7_20250522/pc/13.jpg") },
  { out: "vehicles/xiaomi-yu7/paints/emerald-green.jpg", url: xi("yu7_20260521/base_pc/9.1.jpg") },
  { out: "vehicles/xiaomi-yu7/paints/titanium.jpg", url: xi("yu7_20260521/base_pc/9.2.jpg") },
  { out: "vehicles/xiaomi-yu7/paints/gold-pink.jpg", url: xi("yu7_20260521/base_pc/9.6.jpg") },
  { out: "vehicles/xiaomi-yu7/paints/pearl-white.jpg", url: xi("yu7_20260521/base_pc/9.9.jpg") },
  { out: "vehicles/xiaomi-yu7/paints/cherry-red.jpg", url: xi("yu7_20260521/base_pc/9.10.jpg") },
  { out: "vehicles/xiaomi-yu7/paints/volcanic-grey.jpg", url: xi("yu7_20260521/base_pc/9.11.jpg") },
  { out: "vehicles/xiaomi-yu7/paints/aurora-purple.jpg", url: xi("yu7_20260521/base_pc/9.12.jpg") },
  { out: "vehicles/xiaomi-yu7/interiors/iris-purple.jpg", url: xi("yu7_20250627_01/pc/22-2.png") },
  { out: "vehicles/xiaomi-yu7/interiors/dusk-blue.jpg", url: xi("yu7_20250626/pc/22-4.png") },
  { out: "vehicles/xiaomi-yu7/interiors/coral-orange.jpg", url: xi("yu7_20250626/pc/22-3.png") },
  { out: "vehicles/xiaomi-yu7/wheels/19-diamond.jpg", url: xi("yu7_20250627_01/pc/10.png"), width: 900 },
  { out: "vehicles/xiaomi-yu7/wheels/20-mi.jpg", url: xi("yu7_20260521/base_pc/10-1-mi.jpg"), width: 900 },
  { out: "vehicles/xiaomi-yu7/wheels/20-plum.jpg", url: xi("yu7_20260521/base_pc/10-6.jpg"), width: 900 },
  { out: "vehicles/xiaomi-yu7/wheels/21-blade.jpg", url: xi("yu7_20250627_01/pc/10-3.png"), width: 900 },
  { out: "vehicles/xiaomi-yu7/wheels/21-forged-plum.jpg", url: xi("yu7_20250627_01/pc/10-5.png"), width: 900 },
  { out: "vehicles/xiaomi-yu7/wheels/21-forged-petal.jpg", url: xi("yu7_20250627_01/pc/10-4.png"), width: 900 },

  // ─── Xiaomi YU7 GT ───────────────────────────────────────────────────
  { out: "vehicles/xiaomi-yu7-gt/hero.jpg", url: xi("yu7_20260521/pc/3.jpg") },
  { out: "vehicles/xiaomi-yu7-gt/scene.jpg", url: xi("yu7_20260521/pc/4.jpg") },
  { out: "vehicles/xiaomi-yu7-gt/interior.jpg", url: xi("yu7_20260521/pc/12.jpg") },
  { out: "vehicles/xiaomi-yu7-gt/paints/cherry-red.jpg", url: xi("yu7_20260521/pc/5.jpg") },
  { out: "vehicles/xiaomi-yu7-gt/paints/titanium.jpg", url: xi("yu7_20260521/pc/5-1.jpg") },
  { out: "vehicles/xiaomi-yu7-gt/paints/volcanic-grey.jpg", url: xi("yu7_20260521/pc/5-2.jpg") },
  { out: "vehicles/xiaomi-yu7-gt/paints/obsidian-black.jpg", url: xi("yu7_20260521/pc/5-3.jpg") },
  { out: "vehicles/xiaomi-yu7-gt/paints/pearl-white.jpg", url: xi("yu7_20260521/pc/5-4.jpg") },
  { out: "vehicles/xiaomi-yu7-gt/wheels/21-forged.jpg", url: xi("yu7_20260521/pc/6.jpg"), width: 900 },
  { out: "vehicles/xiaomi-yu7-gt/interiors/gt-red.jpg", url: xi("yu7_20260521/pc/13.jpg") },

  // ─── Xiaomi SkyNomad N90 ─────────────────────────────────────────────
  { out: "vehicles/xiaomi-n90/hero.jpg", url: xi("n90/pc/4.jpg") },
  { out: "vehicles/xiaomi-n90/scene.jpg", url: xi("n90/pc/New_2.jpg") },
  { out: "vehicles/xiaomi-n90/interior.jpg", url: xi("n90/pc/23-1.jpg") },
  { out: "vehicles/xiaomi-n90/paints/wine-red.jpg", url: xi("n90/pc/New_1-1.jpg") },
  { out: "vehicles/xiaomi-n90/paints/mountain-teal.jpg", url: xi("n90/pc/New_1-2.jpg") },
  { out: "vehicles/xiaomi-n90/paints/butterfly-blue.jpg", url: xi("n90/pc/New_1-3.jpg") },
  { out: "vehicles/xiaomi-n90/paints/volcanic-grey.jpg", url: xi("n90/pc/New_1-4.jpg") },
  { out: "vehicles/xiaomi-n90/paints/cool-khaki.jpg", url: xi("n90/pc/New_1-5.jpg") },
  { out: "vehicles/xiaomi-n90/paints/pearl-white.jpg", url: xi("n90/pc/New_1-6.jpg") },
  { out: "vehicles/xiaomi-n90/paints/obsidian-black.jpg", url: xi("n90/pc/New_1-7.jpg") },
  { out: "vehicles/xiaomi-n90/interiors/mocha-brown.jpg", url: xi("n90/pc/25-1.jpg") },
  { out: "vehicles/xiaomi-n90/interiors/sand-beige.jpg", url: xi("n90/pc/25-2.jpg") },
  { out: "vehicles/xiaomi-n90/interiors/night-black.jpg", url: xi("n90/pc/New_6-3.jpg") },
  { out: "vehicles/xiaomi-n90/wheels/20-black.jpg", url: xi("n90_20260907/pc/7-4.jpg"), width: 900 },
  { out: "vehicles/xiaomi-n90/cabin-layout.jpg", url: xi("n90/pc/16-1.jpg") },

  // ─── Tesla Model 3 (2026) ────────────────────────────────────────────
  { out: "vehicles/tesla-model-3/hero.jpg", url: te("Model-3-Premium-Hero-Desktop-CN.jpg") },
  { out: "vehicles/tesla-model-3/interior.jpg", url: te("Model-3-Premium-Minimalist-Carousel-Slide-1-Desktop-Poster.png") },
  { out: "vehicles/tesla-model-3/scene.jpg", url: te("Model-3-Main-Hero-Desktop-LHD.jpg") },
  { out: "vehicles/tesla-model-3/performance.jpg", url: te("Model-3-Performance-Hero-Localized-Desktop-CN.jpg") },
  { out: "vehicles/tesla-model-3/paints/quicksilver.jpg", url: te("Model-3-Premium-Hero-Desktop-CN.jpg") },
  { out: "vehicles/tesla-model-3/paints/ultra-red.jpg", url: te("Model-3-Main-Hero-Desktop-LHD.jpg") },
  { out: "vehicles/tesla-model-3/wheels/20-warp.jpg", url: te("Model-3-Performance-Aero-Carousel-Slide-1-Desktop.jpg"), width: 900 },
  { out: "vehicles/tesla-model-3/interiors/black-white.jpg", url: te("Model-3-Performance-Interior-Carousel-Slide-1-Desktop.jpg") },

  // ─── Tesla Model Y (2026, incl. Model Y L) ───────────────────────────
  { out: "vehicles/tesla-model-y/hero.jpg", url: te("Model-Y-Premium-Hero-Localized-Desktop-CN.jpg") },
  { out: "vehicles/tesla-model-y/interior.jpg", url: te("Model-Y-L-Luxury-Carousel-Slide-1-Desktop-RHD.jpg") },
  { out: "vehicles/tesla-model-y/scene.jpg", url: te("Model-Y-L-Hero-Localized-Desktop-CN.jpg") },
  { out: "vehicles/tesla-model-y/l.jpg", url: te("Model-Y-L-End-Hero-Localized-Desktop-CN.jpg") },
  { out: "vehicles/tesla-model-y/performance.jpg", url: te("Model-Y-Performance-Hero-Desktop-LHD-CN.jpg") },
  { out: "vehicles/tesla-model-y/paints/pearl-white.jpg", url: te("Model-Y-Premium-Hero-Localized-Desktop-CN.jpg") },
  { out: "vehicles/tesla-model-y/paints/stealth-grey.jpg", url: te("Model-Y-Premium-Redesigned-Carousel-Slide-2-Desktop-APAC-LHD-RHD.jpg") },
  { out: "vehicles/tesla-model-y/paints/ultra-red.jpg", url: te("Model-Y-Performance-Hero-Desktop-LHD-CN.jpg") },
  { out: "vehicles/tesla-model-y/wheels/20-helix.jpg", url: te("Model-Y-Premium-Exterior-Carousel-Slide-2-Desktop.jpg"), width: 900 },
  { out: "vehicles/tesla-model-y/interiors/black-white.jpg", url: te("Model-Y-L-Luxury-Carousel-Slide-1-Desktop-RHD.jpg") },

  // ─── Tesla Model S / Model X (2026 inventory) ────────────────────────
  { out: "vehicles/tesla-model-s/hero.jpg", url: te("Model-S-Main-Hero-Desktop-LHD.jpg") },
  { out: "vehicles/tesla-model-s/interior.jpg", url: te("Model-S-Interior-Hero-Desktop-LHD.jpg") },
  { out: "vehicles/tesla-model-s/scene.jpg", url: te("Homepage-Model-S-Desktop-LHD.jpg") },
  { out: "vehicles/tesla-model-s/paints/ultra-red.jpg", url: te("Model-S-Main-Hero-Desktop-LHD.jpg") },
  { out: "vehicles/tesla-model-x/hero.jpg", url: te("Model-X-Main-Hero-Desktop-LHD.jpg") },
  { out: "vehicles/tesla-model-x/interior.jpg", url: te("Model-X-Interior-Hero-Desktop-LHD.jpg") },
  { out: "vehicles/tesla-model-x/scene.jpg", url: te("Model-X-Exterior-Hero-Desktop-LHD.jpg") },
  { out: "vehicles/tesla-model-x/paints/pearl-white.jpg", url: te("Model-X-Main-Hero-Desktop-LHD.jpg") },

  // ─── Tesla Cybertruck ────────────────────────────────────────────────
  { out: "vehicles/tesla-cybertruck/hero.jpg", url: te("Cybertruck-Main-Hero-Desktop.jpg") },
  { out: "vehicles/tesla-cybertruck/interior.jpg", url: te("Cybertruck-Human-Meet-Machine-Desktop.png") },
  { out: "vehicles/tesla-cybertruck/scene.jpg", url: te("Cybertruck-Second-Hero-Desktop.jpg") },
  { out: "vehicles/tesla-cybertruck/wild.jpg", url: te("Cybertruck-Into-The-Wild-Desktop.jpg") },
  { out: "vehicles/tesla-cybertruck/paints/stainless.jpg", url: te("Cybertruck-Main-Hero-Desktop.jpg") },

  // ─── Site scenes (charging / connect / stores) ───────────────────────
  { out: "charging/hero.jpg", url: te("Supercharger-Hero-Desktop-Poster.jpg") },
  { out: "charging/home.jpg", url: xi("charge/pc/section_6_4.png") },
  { out: "connect/hero.jpg", url: te("Model-Y-L-Power-Desktop-CN.jpg") },
  { out: "connect/ecosystem.jpg", url: xi("n90/pc/New_2.jpg") },
  { out: "stores/hero.jpg", url: te("Model-Y-Premium-Hero-Localized-Desktop-CN.jpg") },
  { out: "home/xiaomi.jpg", url: xi("su7_20260319/pc/27-1.png") },
  { out: "home/tesla.jpg", url: te("Model-Y-Premium-Hero-Localized-Desktop-CN.jpg") },
];

async function exists(file) {
  try {
    const s = await stat(file);
    return s.size > 1024;
  } catch {
    return false;
  }
}

async function download(url, attempt = 1) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      Accept: "image/avif,image/webp,image/*,*/*;q=0.8",
    },
  });
  if (!res.ok) {
    if (attempt < 3) return download(url, attempt + 1);
    throw new Error(`${res.status} ${url}`);
  }
  const type = res.headers.get("content-type") ?? "";
  const buf = Buffer.from(await res.arrayBuffer());
  if (!type.startsWith("image/") || buf.length < 1024) {
    if (attempt < 3) return download(url, attempt + 1);
    throw new Error(`not an image (${type}, ${buf.length} bytes): ${url}`);
  }
  return buf;
}

let ok = 0;
let skipped = 0;
const failures = [];
for (const item of manifest) {
  const target = path.join(OUT, item.out);
  if (!FORCE && (await exists(target))) {
    skipped++;
    continue;
  }
  try {
    const buf = await download(item.url);
    await mkdir(path.dirname(target), { recursive: true });
    const width = item.width ?? 1920;
    const output = await sharp(buf)
      .flatten({ background: "#ffffff" })
      .resize({ width, withoutEnlargement: true })
      .jpeg({ quality: item.quality ?? 84, mozjpeg: true, progressive: true })
      .toBuffer();
    await writeFile(target, output);
    ok++;
    console.log(`✓ ${item.out} (${Math.round(output.length / 1024)} KB)`);
  } catch (err) {
    failures.push({ item, err: err instanceof Error ? err.message : String(err) });
    console.error(`✗ ${item.out}: ${err instanceof Error ? err.message : err}`);
  }
}
console.log(`\n${ok} downloaded, ${skipped} skipped, ${failures.length} failed`);
if (failures.length) process.exit(1);
