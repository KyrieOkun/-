# 小米汽车 × 特斯拉 高级定制中心 · MI × TESLA ATELIER

> 两大电动先锋，一个定制殿堂。  
> 面向中国大陆上线的联名高级定制官网：全系车型在线选配、跨品牌联动、充电互通、行程规划、数字钥匙、置换与服务预约，桌面 / 平板 / 手机三端自适应，中英双语。

![CI](https://github.com/KyrieOkun/-/actions/workflows/ci.yml/badge.svg)

---

## 功能总览

| 模块 | 路径 | 说明 |
| --- | --- | --- |
| 首页 | `/` | 全屏车型陈列（Tesla / 小米官网式分屏）、联动亮点、充电网络、定制工坊、资讯 |
| 车型 | `/vehicles` `/vehicles/[slug]` | 10 款在售车型（新一代 SU7、YU7 系列、SU7 Ultra、YU7 GT、澎程 N90、Model 3 / Y / S / X、Cybertruck）品牌 / 车身 / 排序筛选，详情页含版本、亮点、颜色轮毂内饰、图集、参数、质保、JSON-LD |
| 在线选配 | `/vehicles/[slug]/design` | 版本 → 车漆 → 轮毂 → 内饰 → 选装，实时计价（含 2026-2027 购置税减半估算、月供、交付周期、续航修正），URL 可分享 |
| 车型对比 | `/compare` | 最多 4 款跨品牌对比，版本切换，仅显示差异 |
| 联动中心 | `/connect` | 九大联动能力总览与四步接入 |
| 跨品牌车库 | `/connect/garage` | 登录后添加小米 / 特斯拉车辆，实时状态（电量、续航、位置、胎压、软件版本）与远程控制（锁车、空调、闪灯、充电、哨兵、温度） |
| 行程规划 | `/connect/trip-planner` | 250+ 城市节点公路图 + 470+ 超充站，按车型真实能耗与充电曲线规划特斯拉 / 小米混合补能方案 |
| 数字钥匙 | `/connect/keys` | 手机 / 手表 / NFC 钥匙，共享钥匙（驾驶 / 仅解锁 / 代客，有效期，撤销） |
| 生态互联 | `/connect/ecosystem` | 人车家场景编排（如果…那么…）、功能兼容矩阵 |
| 软件更新 | `/connect/ota` | 澎湃 OS 与 Tesla 软件版本时间线 |
| 充电 | `/charging` | 网络数据、跨品牌互通权益、站点实时空闲查询（每分钟刷新，导航跳转高德）、家充桩、费用说明 |
| 定制工坊 | `/atelier` | 限定车漆、手工内饰、碳纤维套件、私享交付；预约定制顾问 |
| 试驾 / 订购 / 置换 / 服务 | `/test-drive` `/order` `/order/[id]` `/trade-in` `/service` | 完整表单校验、订单确认与进度查询、置换估价与联名补贴、服务预约 |
| 账户 | `/account` | 注册 / 登录（手机号或邮箱）、One ID 绑定小米 / Tesla 账号、订单、隐私中心 |
| 资讯 / 门店 / 支持 / 法律 | `/news` `/stores` `/support` `/legal/*` | 资讯分类与详情、14 家门店、FAQ（含 FAQPage JSON-LD）、隐私政策与服务条款（PIPL 合规结构） |

### 车型资料来源（2026 年 9 月核实）

- 小米：新一代 SU7（2026-03-19 上市，21.99 / 24.99 / 30.39 万，CLTC 720 / 902 / 835 km，全系激光雷达 + Thor 700 TOPS）、SU7 Ultra（52.99 / 62.99 / 81.49 万）、YU7 系列（2026-05-21 升级，23.35 – 32.99 万）、YU7 GT（38.99 / 42.99 万）、澎程 N90（2026-09-07 上市，26.99 / 29.99 万）。
- 特斯拉中国：2026 款 Model 3（23.55 – 33.95 万）、Model Y（26.35 – 33.95 万，含六座 Model Y L 33.9 万）、Model S / X 全轮驱动现车（84.29 / 88.29 万）、Cybertruck（海外车型，登记关注）。参数取自 tesla.cn 参数表。
- 充电网络：特斯拉中国大陆 2,100+ 超充站 / 12,000+ 桩，1,000+ 站向非特斯拉车辆开放；小米充电地图 170 万+ 桩（17 万+ 超充）。

价格与参数以品牌官方最新公布为准，站内已在相关页面标注。

### 图片素材

- 车型主视觉、图集、车漆 / 轮毂 / 内饰图片均为品牌官网公开素材：小米汽车 `s1.xiaomiev.com`（新一代 SU7、SU7 Ultra、YU7、YU7 GT、澎程 N90 官网页面），特斯拉 `digitalassets.tesla.com`（tesla.cn Model 3 / Model Y / Cybertruck 页面及 Model S / X 官方主视觉）。
- `scripts/fetch-official-assets.mjs` 是唯一来源清单：`node scripts/fetch-official-assets.mjs` 增量下载，`--force` 全量刷新；脚本会统一缩放到 1920px 宽并压缩为 JPEG。
- 选配器中小米全系每一种车漆、轮毂与内饰都对应官方实拍图；特斯拉官网未公开分色渲染图，故仅主视觉对应的颜色有实拍，其余颜色以官方色值色板呈现。
- 定制工坊（手工缝线、色板、碳纤维）与数字钥匙配图为自制概念图，不含具体车型。
- 官方素材版权归小米集团与 Tesla, Inc. 所有，正式上线前请确认联名授权范围。

---

## 技术栈

- **Next.js 15 (App Router) · React 19 · TypeScript 严格模式**
- **Tailwind CSS v4** 设计系统（Tesla 中性灰阶 + 小米橙 / 特斯拉红点缀 + 定制金）
- **Zod** 请求校验，**jose** 会话 JWT（httpOnly Cookie），`scrypt` 密码哈希
- 持久化：Upstash Redis（REST，零依赖）或内存存储（开发 / 预览）
- **Vitest + Testing Library**：44 项单元 / 组件测试（计价、购置税、行程规划、置换、i18n 键一致性、数据完整性、鉴权、组件渲染）
- SEO：`sitemap.xml`、`robots.txt`、Open Graph 图、Car / NewsArticle / FAQPage JSON-LD、canonical
- PWA：`manifest.webmanifest` 与动态生成的图标
- 安全：CSP、HSTS、X-Frame-Options、Referrer-Policy、Permissions-Policy、速率限制

---

## 本地开发

```bash
npm install
cp .env.example .env.local   # 填写 AUTH_SECRET（≥16 字符）
npm run dev                  # http://localhost:3000
```

常用脚本：

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 开发服务器 |
| `npm run lint` | ESLint（零警告） |
| `npm run typecheck` | TypeScript 检查 |
| `npm test` | Vitest 单元 / 组件测试 |
| `npm run build` / `npm start` | 生产构建与启动 |
| `npm run check` | lint + typecheck + test + build 一键检查 |
| `npm run assets` | 从品牌官网增量拉取车型官方图片 |

---

## 部署

### Vercel（推荐）

1. 导入仓库，框架自动识别为 Next.js（`vercel.json` 已指定 `hkg1` / `sin1` 区域）。
2. 在 Environment Variables 中设置：`AUTH_SECRET`、`NEXT_PUBLIC_SITE_URL`、`UPSTASH_REDIS_REST_URL`、`UPSTASH_REDIS_REST_TOKEN`（可在 Vercel Marketplace 一键创建 Upstash Redis），可选 `NEXT_PUBLIC_ICP`、`NEXT_PUBLIC_PSB`。
3. 绑定域名，Vercel 自动签发 HTTPS。

### Docker / 自建服务器（含中国大陆云厂商）

```bash
# NEXT_PUBLIC_* 会在构建期内联，如需固定可用 --build-arg 传入；
# 也可以在运行期用 SITE_URL / ICP_LICENSE / PSB_LICENSE 覆盖（服务端读取，优先级更高）。
docker build -t mitesla-atelier \
  --build-arg NEXT_PUBLIC_SITE_URL=https://your-domain.com .
docker run -d --name atelier -p 3000:3000 \
  -e AUTH_SECRET=change-me-to-a-long-random-string \
  -e SITE_URL=https://your-domain.com \
  -e UPSTASH_REDIS_REST_URL=... -e UPSTASH_REDIS_REST_TOKEN=... \
  -e ICP_LICENSE=京ICP备XXXXXXXX号 \
  mitesla-atelier
```

镜像基于 `node:22-alpine`、Next.js standalone 输出，自带 `/api/health` 健康检查；建议前置 Nginx / 云负载均衡终止 TLS 并开启 HTTP/2 与 Brotli。若确实需要以纯 HTTP 对外提供服务（无 TLS），请设置 `ALLOW_INSECURE_HTTP=true`（构建参数 + 运行环境变量），否则 HSTS / `upgrade-insecure-requests` / Secure Cookie 会导致资源加载与登录失败。

### 生产清单

- [x] `AUTH_SECRET` 已设置（缺失时生产构建的鉴权接口会拒绝服务）
- [x] Redis 持久化已配置（生产环境缺少 Upstash 凭据时进程会拒绝启动；仅调试可设 `ALLOW_MEMORY_STORE=true`）
- [x] `NEXT_PUBLIC_SITE_URL` 指向正式域名（影响 sitemap / OG / JSON-LD）
- [x] 中国大陆部署填写 ICP / 公安备案号
- [ ] 接入正式支付（`/api/orders` 中标注了 PSP 回调位置）与短信服务商
- [ ] 将 `src/lib/garage.ts` 的模拟遥测替换为小米汽车开放平台 / Tesla Fleet API 适配器（接口已抽象）

---

## 目录结构

```
src/
  app/                 页面与 API 路由（App Router）
  components/          UI 原子组件、布局、车型 / 联动 / 表单组件
  data/                车型、充电站、城市与走廊、资讯、门店、FAQ、法律文本（中英双语）
  lib/                 计价、行程规划、置换估价、鉴权、存储、i18n、工具
public/
  images/              车型与场景视觉（品牌官网公开素材，由 scripts/fetch-official-assets.mjs 维护）
  fonts/               Inter 子集（中文回退系统字体 / MiSans / PingFang）
```

---

## 商标声明

小米、Xiaomi、SU7、YU7、澎程为小米集团商标；Tesla、Model 3、Model Y、Model S、Model X、Cybertruck 为 Tesla, Inc. 商标。本仓库为联名高级定制服务平台实现，车辆销售与交付遵循各品牌官方政策。

---

## English summary

**MI × TESLA ATELIER** is a production-ready, bilingual (zh-CN / en) Next.js 15 site for a Xiaomi EV × Tesla co-branded bespoke programme: full 2026 line-ups with configurators and live pricing, cross-brand Garage with remote controls, a nationwide charging-aware trip planner, digital key sharing, ecosystem scenes, OTA centre, demo-drive / order / trade-in / service flows, account with One ID linking, news, stores, support and legal pages. Run `npm run check` for lint, typecheck, tests and build; deploy to Vercel or with the included Dockerfile.
