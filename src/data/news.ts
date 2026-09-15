import { l, type L10n } from "@/lib/i18n/types";

export type NewsCategory = "launch" | "software" | "charging" | "event" | "atelier";

export interface Article {
  slug: string;
  category: NewsCategory;
  brand: "xiaomi" | "tesla" | "both";
  title: L10n;
  excerpt: L10n;
  date: string;
  readMinutes: number;
  image: string;
  body: L10n[];
  related?: string[];
}

export const articles: Article[] = [
  {
    slug: "atelier-launch",
    category: "atelier",
    brand: "both",
    title: l("小米汽车 × 特斯拉高级定制中心正式上线", "Xiaomi EV × Tesla Atelier is live"),
    excerpt: l("两大品牌在售全系车型在线选配、跨品牌充电互通、行程规划、数字钥匙与生态互联同步开放。", "Configure every model from both brands online, with cross-brand charging, trip planning, digital keys and ecosystem integration available from day one."),
    date: "2026-09-15",
    readMinutes: 4,
    image: "/images/home/hero.jpg",
    body: [
      l("今天，小米汽车 × 特斯拉高级定制中心正式上线。这是首个把两大电动先锋的在售车型、选配与拥车服务放到同一个体验里的平台：新一代小米 SU7、YU7 系列、SU7 Ultra、澎程 N90，以及特斯拉 Model 3、Model Y（含六座 Model Y L）、Model S 与 Model X 现车，均可在线完成选配并支付定金。", "Today the Xiaomi EV × Tesla Atelier goes live — the first platform to bring both pioneers' current line-ups, configurators and ownership services into one experience. The new-generation SU7, YU7 series, SU7 Ultra and SkyNomad N90, together with Tesla Model 3, Model Y (including the six-seat Model Y L), Model S and Model X inventory, can all be configured and reserved online."),
      l("联动中心同步开放：统一账户 One ID、跨品牌车库、充电互通、跨品牌行程规划、数字钥匙互通、生态互联、软件更新中心、服务预约与置换升级九大能力全部上线，无灰度、无等待。", "The Connect hub launches with all nine capabilities live: One ID, cross-brand Garage, charging interoperability, cross-brand trip planning, digital key sharing, ecosystem automation, the software update centre, service booking and trade-in."),
      l("高级定制工坊提供联名限定车漆、手工内饰、碳纤维套件、个性化铭牌与私享交付仪式，由两大品牌官方认证的工坊与交付中心履约。", "The Atelier offers limited co-branded paints, hand-finished interiors, carbon fibre programs, personalised plaques and a private delivery ceremony, fulfilled by workshops and delivery centres certified by both brands."),
    ],
    related: ["su7-new-gen-launch", "tesla-open-superchargers"],
  },
  {
    slug: "n90-launch",
    category: "launch",
    brand: "xiaomi",
    title: l("小米澎程 N90 上市：26.99 万元起，1,705 km 综合续航", "Xiaomi SkyNomad N90 launches from ¥269,900 with 1,705 km combined range"),
    excerpt: l("小米首款大七座增程旗舰 SUV 于 9 月 7 日上市，Max 七座版 26.99 万元，探索版 29.99 万元，首销权益价值 81,000 元。", "Xiaomi's first seven-seat range-extended flagship SUV launched on 7 September: Max 7-seat ¥269,900, Explorer ¥299,900, with ¥81,000 in launch benefits."),
    date: "2026-09-07",
    readMinutes: 5,
    image: "/images/vehicles/xiaomi-n90/hero.jpg",
    body: [
      l("9 月 7 日晚，小米澎程 N90 正式上市。新车基于昆仑架构打造，车长 5,285 mm、轴距 3,080 mm，搭载 76 kWh 三元锂电池与 1.5T 增程器，CLTC 纯电续航最高 505 km、综合续航 1,705 km，零百加速 5.9 秒。", "The SkyNomad N90 launched on the evening of 7 September. Built on the Kunlun architecture, it is 5,285 mm long on a 3,080 mm wheelbase with a 76 kWh NMC battery and 1.5T range extender: up to 505 km electric and 1,705 km combined, 0–100 km/h in 5.9 s."),
      l("N90 Max 七座版售价 26.99 万元，采用 2+2+3 布局、纯平地板与全车贯穿滑轨，支持 11 种空间布局，后排可一键展开 1.8 米大床；N90 Max 探索版 29.99 万元，配备电动升顶露营舱与 6 kW 外放电。", "The N90 Max 7-seat is ¥269,900 with 2+2+3 seating, a flat floor and full-length rails for 11 layouts, including a 1.8 m bed. The ¥299,900 Explorer adds an electric pop-top and 6 kW vehicle-to-load."),
      l("10 月 7 日前下定的用户可享价值 81,000 元的首销权益。本站已开放 N90 全系在线选配与定金支付。", "Orders placed before 7 October receive ¥81,000 in launch benefits. Online configuration and deposits are open now on this site."),
    ],
    related: ["yu7-gt-launch", "su7-new-gen-launch"],
  },
  {
    slug: "tesla-open-superchargers",
    category: "charging",
    brand: "tesla",
    title: l("特斯拉向非特斯拉车辆开放 1,000+ 座超级充电站，小米车主同价充电", "Tesla opens 1,000+ Superchargers to non-Tesla EVs — Xiaomi owners pay the same rate"),
    excerpt: l("截至 2026 年 4 月，特斯拉在中国内地向非特斯拉品牌车辆开放超 1,000 座超级充电站与 400 余座目的地充电站，覆盖全部省份与直辖市。", "As of April 2026 Tesla has opened over 1,000 Supercharger stations and 400+ Destination Charging sites in mainland China to non-Tesla EVs, across every province."),
    date: "2026-05-06",
    readMinutes: 3,
    image: "/images/charging/hero.jpg",
    body: [
      l("特斯拉宣布，中国内地已有 1,000 多座超级充电站与 400 多座目的地充电站向非特斯拉品牌新能源车主开放，100% 覆盖所有省份与直辖市，最大充电功率可达 250 kW，开放站点的充电价格与特斯拉车主完全一致。", "Tesla announced that more than 1,000 Supercharger stations and 400 Destination Charging sites in mainland China are now open to non-Tesla EV drivers, covering every province and municipality at up to 250 kW, priced identically to Tesla owners."),
      l("小米 SU7、YU7 车主可通过联名账户在本站或车机充电地图直接查看开放站点、实时空闲桩与分时电价，即插即充并合并账单。", "Xiaomi SU7 and YU7 owners can use their linked account to see open stations, live availability and time-of-use tariffs here or on the in-car charging map, with Plug & Charge and a consolidated bill."),
      l("特斯拉全球超级充电桩已突破 80,000 根，中国大陆超过 2,100 座站点、12,000 根超充桩，2025 年 9 月起 V4 超充桩陆续在北京、上海等城市上线并同步向第三方车辆开放。", "Tesla now operates 80,000+ Supercharger stalls globally, including 2,100+ stations and 12,000+ stalls in mainland China. V4 stalls have been rolling out in Beijing, Shanghai and other cities since September 2025 and are open to third-party vehicles."),
    ],
    related: ["xiaomi-charging-map", "atelier-launch"],
  },
  {
    slug: "yu7-gt-launch",
    category: "launch",
    brand: "xiaomi",
    title: l("小米 YU7 GT 上市 38.99 万元，YU7 标准版 23.35 万元同步发布", "Xiaomi YU7 GT launches at ¥389,900 alongside the ¥233,500 YU7 Standard"),
    excerpt: l("5 月 21 日小米人车家全生态发布会上，YU7 GT 以 990 PS、2.92 秒破百、纽北 SUV 圈速纪录登场；YU7 系列形成 23.35-38.99 万元五款阵容。", "At the 21 May Human × Car × Home event, the YU7 GT arrived with 990 PS, 0–100 km/h in 2.92 s and the Nürburgring SUV record; the YU7 line now spans five trims from ¥233,500 to ¥389,900."),
    date: "2026-05-21",
    readMinutes: 4,
    image: "/images/vehicles/xiaomi-yu7-gt/hero.jpg",
    body: [
      l("小米 YU7 GT 官方指导价 38.99 万元，大满配 42.99 万元。新车搭载小米 V8s EVO 超级电机与自研碳化硅功率模块，前 288 kW + 后 450 kW，综合 738 kW / 990 PS，最高车速 300 km/h，CLTC 续航 705 km。", "The YU7 GT lists at ¥389,900 (¥429,900 fully specified). It pairs Xiaomi V8s EVO motors with in-house SiC power modules — 288 kW front, 450 kW rear, 738 kW / 990 PS combined — for a 300 km/h top speed and 705 km CLTC range."),
      l("同场发布的 YU7 标准版售价 23.35 万元，73 kWh 电池、CLTC 643 km、零百 5.9 秒，全系标配激光雷达与 800V 平台；原标准版更名长续航版（25.35 万元，835 km）。", "The new YU7 Standard is ¥233,500 with a 73 kWh battery, 643 km CLTC and 0–100 km/h in 5.9 s; LiDAR and the 800 V platform remain standard. The former Standard becomes the Long Range (¥253,500, 835 km)."),
    ],
    related: ["su7-new-gen-launch", "n90-launch"],
  },
  {
    slug: "su7-new-gen-launch",
    category: "launch",
    brand: "xiaomi",
    title: l("新一代小米 SU7 上市：21.99 万元起，全系激光雷达与 700 TOPS", "New-generation Xiaomi SU7 launches from ¥219,900 with LiDAR and 700 TOPS on every trim"),
    excerpt: l("3 月 19 日，新一代 SU7 以标准版 21.99 万、Pro 24.99 万、Max 30.39 万元上市，CLTC 续航 720 / 902 / 835 km，34 分钟锁单 1.5 万台。", "On 19 March the new SU7 launched at ¥219,900 / ¥249,900 / ¥303,900 with 720 / 902 / 835 km CLTC range, taking 15,000 firm orders in 34 minutes."),
    date: "2026-03-19",
    readMinutes: 5,
    image: "/images/vehicles/xiaomi-su7/hero.jpg",
    body: [
      l("新一代 SU7 定位「新一代驾驶者之车」，全系换装 HyperEngine V6s Plus 电机；标准版与 Pro 版升级至 752V 高压平台，Max 版进入 897V「准 900V」时代。电池分别为 73 kWh 磷酸铁锂、96.3 kWh 磷酸铁锂与 101.7 kWh 麒麟三元锂。", "Positioned as 'the driver's car, reimagined', the new SU7 moves every trim to HyperEngine V6s Plus motors; Standard and Pro adopt a 752 V platform while Max reaches 897 V. Batteries are 73 kWh LFP, 96.3 kWh LFP and 101.7 kWh Qilin NMC."),
      l("智驾平权：标准版即标配激光雷达、4D 毫米波雷达与 700 TOPS 英伟达 Thor 芯片，端到端城市 NOA 全系可用。安全升级包括门锁备用电源、半隐藏机械门把手、9 气囊与全系前四活塞卡钳。", "ADAS parity: even the Standard gets LiDAR, 4D radar and a 700 TOPS NVIDIA Thor computer, with end-to-end urban NOA available across the range. Safety upgrades include door-lock backup power, semi-hidden mechanical handles, nine airbags and four-piston front calipers on every trim."),
      l("外观新增卡布里蓝、赤霞红、靛石绿三款专属色，共 9 色车漆、5 款内饰、6 款轮毂，Max 版另有卡布里蓝特别版内饰。", "Three new exclusive paints — Capri Blue, Chixia Red and Indigo Stone Green — bring the palette to nine, with five interiors and six wheels; Max adds a Capri Blue special-edition interior."),
    ],
    related: ["yu7-gt-launch", "atelier-launch"],
  },
  {
    slug: "model-y-l-china",
    category: "launch",
    brand: "tesla",
    title: l("Model Y L 六座版上架特斯拉中国官网，售价 33.9 万元", "Model Y L six-seater arrives on Tesla China at ¥339,000"),
    excerpt: l("8 月 12 日，特斯拉中国官网上架 Model Y L：2+2+2 六座、CLTC 751 km、4.5 秒破百，预计 9 月交付。", "On 12 August Tesla China listed the Model Y L: 2+2+2 seating, 751 km CLTC and 0–100 km/h in 4.5 s, with deliveries from September."),
    date: "2026-08-12",
    readMinutes: 3,
    image: "/images/vehicles/tesla-model-y/scene.jpg",
    body: [
      l("Model Y L 通过加长车身与轴距（4,976 mm / 3,040 mm）为三排座舱提供空间基础，第二排为独立座椅并配备加热、通风与电动腿托，第三排可电动放倒。", "The Model Y L stretches body and wheelbase to 4,976 mm / 3,040 mm to make room for three rows; second-row captain's chairs add heating, ventilation and power leg rests, and the third row folds electrically."),
      l("新车 CLTC 续航 751 km，双电机全轮驱动 4.5 秒破百，售价 33.9 万元。本站 Model Y 选配器已加入 Model Y L 版本，支持在线定购。", "Rated at 751 km CLTC with dual-motor AWD and 0–100 km/h in 4.5 s, it is priced at ¥339,000. The Model Y L is now selectable in this site's Model Y configurator."),
    ],
    related: ["tesla-open-superchargers", "model-3-2026"],
  },
  {
    slug: "model-3-2026",
    category: "launch",
    brand: "tesla",
    title: l("2026 款 Model 3 上市：23.55 万元起，新增前保险杠摄像头", "2026 Model 3 arrives from ¥235,500 with a new front bumper camera"),
    excerpt: l("四个版本售价 23.55-33.95 万元与老款一致，前后车标改为全黑，续航覆盖 634-830 km。", "Four trims from ¥235,500 to ¥339,500, unchanged pricing, black badging and 634–830 km range."),
    date: "2026-01-06",
    readMinutes: 3,
    image: "/images/vehicles/tesla-model-3/hero.jpg",
    body: [
      l("2026 款 Model 3 提供后轮驱动（23.55 万）、长续航后轮驱动（25.95 万）、长续航全轮驱动（28.55 万）与高性能全轮驱动（33.95 万）四个版本，CLTC 续航分别为 634 / 830 / 753 / 623 km。", "The 2026 Model 3 comes as RWD (¥235,500), Long Range RWD (¥259,500), Long Range AWD (¥285,500) and Performance AWD (¥339,500), rated at 634 / 830 / 753 / 623 km CLTC."),
      l("新增前保险杠摄像头提升泊车与低速可视性，前后车标换为全黑设计，车尾 Logo 与 Model Y L 保持一致。", "A new front bumper camera improves parking visibility; badges switch to black, with the rear logo matching the Model Y L."),
    ],
    related: ["model-y-l-china"],
  },
  {
    slug: "xiaomi-charging-map",
    category: "charging",
    brand: "xiaomi",
    title: l("小米充电网络覆盖 170 万+ 充电桩，积分可抵充电服务费", "Xiaomi charging network reaches 1.7M+ stalls; points now offset service fees"),
    excerpt: l("截至 2026 年 2 月 11 日，小米充电地图接入 170 万+ 充电桩，含 17 万+ 超充桩，覆盖 2,815 个区县与 7,822 个高速服务区。", "As of 11 February 2026 the Xiaomi charging map covers 1.7M+ stalls including 170k+ superchargers across 2,815 districts and 7,822 highway service areas."),
    date: "2026-02-12",
    readMinutes: 3,
    image: "/images/charging/home.jpg",
    body: [
      l("小米汽车公布补能网络最新进展：充电地图接入充电桩较去年增长 66.7%，其中 17 万+ 超充桩、110 万+ 直流快充桩。2024 年 12 月起接入蔚来、小鹏、理想超 3 万个三方充电桩并支持实时数据。", "Xiaomi EV reports its charging map grew 66.7% year on year, with 170k+ superchargers and 1.1M+ DC fast chargers. Since December 2024 it has integrated 30k+ NIO, XPeng and Li Auto stalls with live data."),
      l("小米积分现可抵扣充电服务费；自建 600 kW 液冷小米超级充电站已在北京、上海、杭州等城市陆续投入运营。", "Xiaomi points can now offset charging service fees, and Xiaomi's own 600 kW liquid-cooled Superchargers are operating in Beijing, Shanghai and Hangzhou."),
    ],
    related: ["tesla-open-superchargers"],
  },
];

export const articlesBySlug: Record<string, Article> = Object.fromEntries(articles.map((a) => [a.slug, a]));
