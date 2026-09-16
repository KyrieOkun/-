import { l } from "@/lib/i18n/types";
import type { L10n } from "@/lib/i18n/types";

export interface ConnectFeature {
  id: string;
  icon: string;
  title: L10n;
  summary: L10n;
  bullets: L10n[];
  href: string;
  status: "live" | "beta";
  requiresLogin?: boolean;
  image?: string;
}

export const connectFeatures: ConnectFeature[] = [
  {
    id: "one-id",
    icon: "fingerprint",
    title: l("统一账户 One ID", "One ID"),
    summary: l("一个账户绑定小米账号与 Tesla 账号，订单、车辆、充电、服务全部打通。", "Link your Xiaomi Account and Tesla Account once — orders, vehicles, charging and service in one place."),
    bullets: [
      l("小米账号 / Tesla 账号一键授权绑定，OAuth 2.0 安全协议", "One-tap OAuth 2.0 linking for Xiaomi and Tesla accounts"),
      l("会员积分互通：小米积分可抵充电服务费，Tesla 推荐奖励同步", "Points interoperability: Xiaomi points offset charging fees; Tesla referral credits sync"),
      l("统一隐私中心，数据授权可随时撤销", "Unified privacy centre with revocable data consents"),
    ],
    href: "/account",
    status: "live",
  },
  {
    id: "garage",
    icon: "car-front",
    title: l("跨品牌车库", "Cross-brand Garage"),
    summary: l("SU7 与 Model Y 在同一个页面：电量、续航、位置、锁车状态与远程控制。", "Your SU7 and Model Y on one screen: charge, range, location, lock state and remote controls."),
    bullets: [
      l("实时车辆状态：电量、续航、里程、位置、胎压、软件版本", "Live state: battery, range, odometer, location, tyre pressure, software"),
      l("远程控制：上锁 / 解锁、空调预热、闪灯寻车、开始 / 停止充电", "Remote: lock/unlock, precondition, flash, start/stop charging"),
      l("基于小米汽车开放平台与 Tesla Fleet API 官方接口", "Built on Xiaomi EV Open Platform and Tesla Fleet API"),
    ],
    href: "/connect/garage",
    status: "live",
    requiresLogin: true,
  },
  {
    id: "charging",
    icon: "plug-zap",
    title: l("充电互通", "Charging Interoperability"),
    summary: l("特斯拉超充向小米车主开放 1,000+ 站，小米充电地图 170 万+ 桩，一个 App 即插即充、统一支付。", "1,000+ Tesla Superchargers open to Xiaomi owners and 1.7M+ stalls on the Xiaomi charging map — one app, plug & charge, one bill."),
    bullets: [
      l("即插即充：车辆身份自动识别，无需扫码", "Plug & Charge: automatic vehicle authentication, no QR codes"),
      l("统一账单与发票，支持微信 / 支付宝 / 银联", "One bill and invoice via WeChat Pay, Alipay and UnionPay"),
      l("实时空闲桩与排队信息，路线内自动推荐", "Live availability and queue data, suggested en route"),
    ],
    href: "/charging",
    status: "live",
  },
  {
    id: "trip",
    icon: "route",
    title: l("跨品牌行程规划", "Cross-brand Trip Planner"),
    summary: l("输入起点终点与车型，自动混合特斯拉超充与小米超充规划补能，精确到到达电量。", "Enter a route and vehicle; we plan charging stops across Tesla and Xiaomi superchargers down to arrival SoC."),
    bullets: [
      l("基于车型真实能耗曲线与充电曲线建模", "Modelled on each vehicle's consumption and charge curves"),
      l("支持出发电量、到达电量下限与偏好网络设置", "Set start SoC, arrival buffer and preferred networks"),
      l("一键发送至车机导航（小米澎湃 OS / Tesla 导航）", "Send to car navigation (HyperOS / Tesla Navigation)"),
    ],
    href: "/connect/trip-planner",
    status: "live",
  },
  {
    id: "keys",
    icon: "key-round",
    title: l("数字钥匙互通", "Digital Key"),
    summary: l("手机、手表、手环一把钥匙跨品牌通用，UWB 无感解锁，一键分享给家人。", "One key on phone, watch or band across both brands — UWB hands-free unlock and one-tap family sharing."),
    bullets: [
      l("小米手环 / 手表 / Apple Watch 解锁 Tesla 与小米汽车", "Unlock Tesla and Xiaomi vehicles with Mi Band, Xiaomi Watch or Apple Watch"),
      l("分享钥匙支持驾驶 / 仅解锁 / 代客三种权限与有效期", "Shared keys with Drive, Unlock-only and Valet permissions and expiry"),
      l("钥匙全部基于安全芯片与端到端加密", "Secure-element based, end-to-end encrypted"),
    ],
    href: "/connect/keys",
    status: "live",
    requiresLogin: true,
  },
  {
    id: "ecosystem",
    icon: "house-wifi",
    title: l("生态互联", "Ecosystem"),
    summary: l("人车家全生态 × Tesla App：回家自动开灯开空调，出门车辆提前预热，米家设备直接上车。", "Human × Car × Home meets Tesla App: lights and AC on as you arrive, cabin preheated before you leave, Mi Home devices in the car."),
    bullets: [
      l("到家 / 离家场景：车辆位置触发米家场景", "Arrive/leave-home scenes triggered by vehicle location"),
      l("Tesla 车辆事件（充电完成、哨兵告警）推送到小米手机与音箱", "Tesla events (charge complete, Sentry alerts) on Xiaomi phones and speakers"),
      l("小米 CarIoT 配件生态开放：磁吸按键、后备厢电源轨", "Xiaomi CarIoT accessories: magnetic buttons, cargo power rail"),
    ],
    href: "/connect/ecosystem",
    status: "live",
  },
  {
    id: "ota",
    icon: "download-cloud",
    title: l("软件更新中心", "Software Updates"),
    summary: l("澎湃 OS 与 Tesla 软件的版本时间线、新功能与更新计划一目了然。", "Release timelines, features and rollout plans for HyperOS and Tesla software."),
    bullets: [
      l("两大品牌 OTA 版本说明中英对照", "Bilingual release notes for both brands"),
      l("可订阅更新提醒，联动车库显示当前版本", "Subscribe to alerts; garage shows installed version"),
      l("联动功能随 OTA 同步升级", "Integration features ship with OTA"),
    ],
    href: "/connect/ota",
    status: "live",
  },
  {
    id: "service",
    icon: "wrench",
    title: l("服务预约", "Service Booking"),
    summary: l("保养、维修、取送车、上门充电与事故救援，跨品牌一个入口统一预约。", "Maintenance, repairs, pick-up & delivery, mobile charging and roadside — booked in one place for both brands."),
    bullets: [
      l("全国 300+ 服务中心与移动服务车", "300+ service centres and mobile service vans nationwide"),
      l("上门取送车，维保进度实时推送", "Valet pick-up with live progress updates"),
      l("联动保养提醒：基于车辆真实里程与电池健康", "Smart reminders based on real mileage and battery health"),
    ],
    href: "/service",
    status: "live",
  },
  {
    id: "trade-in",
    icon: "arrow-left-right",
    title: l("置换升级", "Trade-In"),
    summary: l("特斯拉换小米、小米换特斯拉，联名置换补贴最高 12,000 元，估价、过户、交付一站式。", "Tesla to Xiaomi or Xiaomi to Tesla — up to ¥12,000 co-branded bonus with valuation, transfer and delivery in one flow."),
    bullets: [
      l("两分钟在线估价，7 天报价有效", "Two-minute online valuation, valid for 7 days"),
      l("旧车上门验车、代办过户", "At-home inspection and transfer handled for you"),
      l("置换款可直接抵扣新车尾款", "Trade-in value applied directly to your balance"),
    ],
    href: "/trade-in",
    status: "live",
  },
];

export const connectStats = [
  { value: "2", label: l("品牌，一个账户", "brands, one account") },
  { value: "1,000+", label: l("跨品牌开放的特斯拉超充站", "Tesla Superchargers open across brands") },
  { value: "170万+", labelEn: "1.7M+", label: l("小米充电地图接入桩", "stalls on the Xiaomi charging map") },
  { value: "300+", label: l("服务与交付中心", "service & delivery centres") },
];

export interface OtaRelease {
  id: string;
  brand: "xiaomi" | "tesla";
  version: string;
  date: string;
  title: L10n;
  notes: L10n[];
  status: "rolling" | "released" | "scheduled";
}

export const otaReleases: OtaRelease[] = [
  {
    id: "hyperos-3-2",
    brand: "xiaomi",
    version: "Xiaomi HyperOS 3.2",
    date: "2026-09-10",
    title: l("端到端 NOA 2.0 全量推送，联名充电互通上线", "End-to-end NOA 2.0 full rollout; co-branded charging interop"),
    notes: [
      l("车位到车位 2.0：支持园区内环路与机械车位", "Door-to-door 2.0: campus loops and mechanical parking"),
      l("充电地图新增特斯拉开放站点实时状态与即插即充", "Tesla open stations with live status and Plug & Charge on the charging map"),
      l("小米手表数字钥匙支持 UWB 无感解锁 Tesla（配合联名账户）", "Xiaomi Watch UWB key for Tesla vehicles (with linked account)"),
      l("天际屏新增导航车道级渲染", "Lane-level navigation rendering on HyperVision"),
    ],
    status: "rolling",
  },
  {
    id: "tesla-2026-32",
    brand: "tesla",
    version: "Tesla 2026.32.5",
    date: "2026-09-04",
    title: l("FSD 智能辅助驾驶 v14 中国版更新，非特斯拉车辆充电权益", "FSD (Supervised) v14 China update; non-Tesla charging benefits"),
    notes: [
      l("城市街道智能辅助驾驶：环岛与无保护左转策略优化", "City streets: improved roundabout and unprotected-left handling"),
      l("超级充电站：非特斯拉车主分时电价与停车费减免在 App 内可见", "Superchargers: time-of-use rates and parking waivers visible to non-Tesla drivers"),
      l("后排屏新增儿童模式与游戏", "Rear screen: kids mode and new games"),
      l("Model Y L 第二排座椅记忆位置", "Model Y L second-row seat memory"),
    ],
    status: "released",
  },
  {
    id: "hyperos-3-1",
    brand: "xiaomi",
    version: "Xiaomi HyperOS 3.1",
    date: "2026-07-22",
    title: l("YU7 GT 赛道模式 Pro 与全系露营模式", "YU7 GT Track Mode Pro and camping mode for the line-up"),
    notes: [
      l("赛道模式 Pro：圈速计时、遥测导出、扭矩分配自定义", "Track Mode Pro: lap timing, telemetry export, custom torque split"),
      l("露营模式：空调 / 灯光 / 音响 12 小时低功耗联动", "Camping mode: 12-hour low-power climate, lights and audio"),
      l("小爱同学车外语音：开前备厢、开充电口", "Outside-vehicle voice: open frunk and charge port"),
    ],
    status: "released",
  },
  {
    id: "tesla-2026-20",
    brand: "tesla",
    version: "Tesla 2026.20.3",
    date: "2026-06-18",
    title: l("Grok 语音助手中文版，能量应用增强", "Grok voice assistant (Chinese); Energy app improvements"),
    notes: [
      l("Grok 语音助手支持中文自然对话与导航意图", "Grok voice assistant with natural Chinese conversation and navigation intents"),
      l("能量应用：按行程显示能耗构成", "Energy app: per-trip consumption breakdown"),
      l("哨兵模式事件推送延迟降低", "Lower latency for Sentry Mode notifications"),
    ],
    status: "released",
  },
  {
    id: "hyperos-3-3",
    brand: "xiaomi",
    version: "Xiaomi HyperOS 3.3",
    date: "2026-11-15",
    title: l("跨品牌行程规划上车，Tesla 超充预约充电", "In-car cross-brand trip planner; Tesla Supercharger reservations"),
    notes: [
      l("车机导航直接调用联名行程规划，混合补能路线", "Cross-brand trip planner built into navigation"),
      l("支持预约特斯拉 V4 超充桩（试点城市）", "Reserve Tesla V4 stalls in pilot cities"),
    ],
    status: "scheduled",
  },
];
