import { l, type L10n } from "@/lib/i18n/types";

export interface Faq {
  id: string;
  group: "order" | "charging" | "connect" | "service" | "atelier";
  q: L10n;
  a: L10n;
}

export const faqs: Faq[] = [
  { id: "f1", group: "order", q: l("本站与小米汽车、特斯拉官方渠道是什么关系？", "How does this site relate to Xiaomi EV and Tesla official channels?"), a: l("本站是小米汽车 × 特斯拉联名高级定制服务平台。车辆价格、配置、生产与交付均遵循各品牌官方政策，定金与订单会同步至对应品牌官方系统，由官方交付中心完成交付并提供质保。", "This is the Xiaomi EV × Tesla co-branded bespoke platform. Pricing, configuration, production and delivery follow each brand's official policies; deposits and orders are synced to the brand's official systems and fulfilled by official delivery centres with full warranty.") },
  { id: "f2", group: "order", q: l("定金可以退吗？", "Is the deposit refundable?"), a: l("支付定金后 7 天内可无理由全额退款；锁定配置并进入排产后定金不可退。SU7 Ultra 纽北限量版与定制工坊项目另有专属条款。", "Deposits are fully refundable within 7 days. Once the configuration is locked and production begins, deposits are non-refundable. The SU7 Ultra Nürburgring Edition and Atelier programs have specific terms.") },
  { id: "f3", group: "order", q: l("购置税怎么算？", "How is purchase tax calculated?"), a: l("2026-2027 年新能源汽车购置税减半征收，按不含税车价 10% 计算后减半，每辆减税额不超过 15,000 元。选配器中的估算已按此规则计算，最终以税务机关核定为准。", "For 2026–2027 NEV purchase tax is halved: 10% of the ex-VAT price, then 50% off, capped at a ¥15,000 reduction per vehicle. The configurator estimate follows this rule; the final amount is set by the tax authority.") },
  { id: "f4", group: "order", q: l("Model S / Model X 为什么只有现车？", "Why are Model S / Model X inventory only?"), a: l("2026 款 Model S 与 Model X 以既定配置现车形式在中国大陆销售，不支持个性化定制。本站展示的选装项以现车实际配置为准，下单后交付顾问会与您确认可选现车。", "In mainland China the 2026 Model S and Model X are sold as inventory vehicles in set configurations. Options shown reflect available stock; your delivery advisor will confirm matching vehicles after you order.") },
  { id: "f5", group: "order", q: l("Cybertruck 什么时候能在中国买到？", "When will Cybertruck be available in China?"), a: l("Cybertruck 目前仅在北美等海外市场销售，中国大陆尚未上市。您可以在车型页登记关注，我们会在有引进信息时第一时间通知。", "Cybertruck is currently sold only in North America and select overseas markets. Register your interest on the vehicle page and we'll notify you as soon as there is news for mainland China.") },
  { id: "f6", group: "charging", q: l("小米车主可以用特斯拉超级充电站吗？", "Can Xiaomi owners use Tesla Superchargers?"), a: l("可以。截至 2026 年 4 月，特斯拉在中国内地已向非特斯拉车辆开放 1,000+ 座超级充电站与 400+ 座目的地充电站，最大 250 kW，价格与特斯拉车主一致。通过联名账户可即插即充并合并账单。", "Yes. As of April 2026, 1,000+ Tesla Supercharger stations and 400+ Destination Charging sites in mainland China are open to non-Tesla EVs at up to 250 kW, priced the same as for Tesla owners. With a linked account you get Plug & Charge and one bill.") },
  { id: "f7", group: "charging", q: l("特斯拉车主可以用小米超充站吗？", "Can Tesla owners use Xiaomi Superchargers?"), a: l("可以。小米 600 kW 液冷超充站及小米充电地图接入的 170 万+ 充电桩均对特斯拉车辆开放；特斯拉车型充电峰值受车辆本身限制（最高 250 kW）。", "Yes. Xiaomi 600 kW liquid-cooled Superchargers and the 1.7M+ stalls on the Xiaomi charging map are open to Tesla vehicles; peak power is limited by the car (up to 250 kW).") },
  { id: "f8", group: "charging", q: l("家充桩安装包含什么？", "What does home charger installation include?"), a: l("小米车型赠送 7 kW 家充桩及基础安装（30 米以内线缆、标准穿管）；特斯拉家庭充电服务包含第三代壁挂式连接器与标准安装。超出标准部分按实际费用结算。", "Xiaomi vehicles include a 7 kW wall connector with standard installation (up to 30 m cabling, standard conduit); the Tesla home charging package includes a Gen 3 Wall Connector with standard installation. Non-standard work is billed at cost.") },
  { id: "f9", group: "connect", q: l("统一账户会共享哪些数据？", "What data does One ID share?"), a: l("仅在您明确授权后同步车辆基础状态、充电记录与订单信息，用于车库、充电与服务功能。您可以在隐私中心随时查看并撤销授权，撤销后相关数据将在 30 天内删除。", "Only after explicit consent do we sync basic vehicle state, charging history and order data for Garage, charging and service features. You can review and revoke consent any time in the Privacy Centre; data is deleted within 30 days of revocation.") },
  { id: "f10", group: "connect", q: l("数字钥匙支持哪些设备？", "Which devices support the digital key?"), a: l("小米手机（澎湃 OS 2 及以上）、小米手表 / 手环（UWB 版本支持无感解锁）、iPhone（UWB）与 Apple Watch。共享钥匙可设置驾驶 / 仅解锁 / 代客三种权限与有效期。", "Xiaomi phones (HyperOS 2+), Xiaomi Watch / Band (UWB models support hands-free unlock), iPhone (UWB) and Apple Watch. Shared keys support Drive, Unlock-only and Valet permissions with expiry.") },
  { id: "f11", group: "connect", q: l("行程规划的到达电量准确吗？", "How accurate is the trip planner's arrival charge?"), a: l("规划器基于各车型官方能耗与充电曲线、路网距离与季节修正建模，通常误差在 ±5% 以内。实际能耗受温度、载重、车速与风况影响，建议保留 10% 以上到达余量。", "The planner models official consumption and charge curves, road distances and seasonal factors, typically within ±5%. Real consumption varies with temperature, load, speed and wind — we recommend keeping a 10%+ arrival buffer.") },
  { id: "f12", group: "service", q: l("保养周期是多久？", "What is the service interval?"), a: l("小米汽车建议每 1 年或 2 万公里保养一次；特斯拉车辆无固定保养周期，按车辆提示更换空调滤芯、制动液等。联动车库会根据真实里程与电池健康自动提醒。", "Xiaomi EV recommends service every 12 months or 20,000 km; Tesla vehicles have no fixed interval and prompt for items such as cabin filters and brake fluid. The Garage sends reminders based on real mileage and battery health.") },
  { id: "f13", group: "service", q: l("跨品牌置换补贴怎么领？", "How do I get the cross-brand trade-in bonus?"), a: l("在置换页面完成估价并提交申请，验车通过后补贴直接抵扣新车尾款：小米换特斯拉或特斯拉换小米最高 12,000 元，同品牌置换最高 8,000 元。", "Complete a valuation and apply on the Trade-In page. After inspection the bonus is applied to your balance: up to ¥12,000 for Xiaomi↔Tesla trade-ins and ¥8,000 for same-brand trade-ins.") },
  { id: "f14", group: "atelier", q: l("定制工坊项目会影响原厂质保吗？", "Do Atelier programs affect the factory warranty?"), a: l("不会。所有定制项目均由两大品牌官方认证工坊按原厂标准施工，使用原厂或认证材料，质保范围与官方一致，并额外提供定制部件 3 年质保。", "No. All programs are executed by workshops certified by both brands to factory standards using original or certified materials. Factory warranty is preserved, plus a 3-year warranty on bespoke parts.") },
  { id: "f15", group: "atelier", q: l("定制周期多长？", "How long do Atelier programs take?"), a: l("限定车漆与内饰项目通常在交付周期基础上增加 2-4 周；碳纤维套件与纽北限量版等专属项目为 6-10 周。定制顾问会在下单时给出精确排期。", "Limited paints and interior programs typically add 2–4 weeks to delivery; carbon fibre kits and exclusive programs such as the Nürburgring Edition take 6–10 weeks. Your advisor confirms an exact schedule at order.") },
];

export const contact = {
  hotline: "400-800-0000",
  roadside: "400-800-0001",
  email: "care@mitesla-atelier.com",
  /** Own centres plus partner service network; the data set lists flagship/experience/delivery sites only. */
  networkClaim: l("300+ 服务与交付中心（含合作网络）", "300+ service and delivery centres (incl. partner network)"),
} as const;

export interface Store {
  id: string;
  name: L10n;
  type: "flagship" | "experience" | "delivery" | "service";
  brands: ("xiaomi" | "tesla")[];
  cityId: string;
  address: L10n;
  hours: string;
  phone: string;
  services: L10n[];
  image?: string;
}

export const stores: Store[] = [
  { id: "bj-flagship", name: l("北京王府井联名旗舰店", "Beijing Wangfujing Flagship"), type: "flagship", brands: ["xiaomi", "tesla"], cityId: "beijing", address: l("东城区王府井大街 269 号 1-2 层", "L1–L2, 269 Wangfujing St, Dongcheng"), hours: "10:00-22:00", phone: "010-8500-0100", services: [l("全系展车", "Full line-up on display"), l("定制工坊体验区", "Atelier studio"), l("试驾", "Demo drives"), l("交付", "Delivery")] },
  { id: "bj-yizhuang-delivery", name: l("北京亦庄交付中心", "Beijing Yizhuang Delivery Centre"), type: "delivery", brands: ["xiaomi"], cityId: "beijing", address: l("北京经济技术开发区科创十一街 18 号", "18 Kechuang 11th St, Beijing E-Town"), hours: "09:00-20:00", phone: "010-8500-0102", services: [l("新车交付", "New vehicle delivery"), l("私享交付仪式", "Private delivery ceremony"), l("上牌服务", "Registration")] },
  { id: "bj-chaoyang-service", name: l("北京朝阳服务中心", "Beijing Chaoyang Service Centre"), type: "service", brands: ["xiaomi", "tesla"], cityId: "beijing", address: l("朝阳区东四环中路 78 号", "78 East 4th Ring Middle Rd, Chaoyang"), hours: "08:30-18:30", phone: "010-8500-0103", services: [l("保养维修", "Maintenance & repair"), l("钣喷", "Body & paint"), l("上门取送车", "Valet pick-up")] },
  { id: "sh-flagship", name: l("上海前滩太古里联名旗舰店", "Shanghai Qiantan Taikoo Li Flagship"), type: "flagship", brands: ["xiaomi", "tesla"], cityId: "shanghai", address: l("浦东新区东育路 500 号 L1", "L1, 500 Dongyu Rd, Pudong"), hours: "10:00-22:00", phone: "021-6100-0200", services: [l("全系展车", "Full line-up on display"), l("定制工坊体验区", "Atelier studio"), l("试驾", "Demo drives")] },
  { id: "sh-lingang-delivery", name: l("上海临港交付中心", "Shanghai Lingang Delivery Centre"), type: "delivery", brands: ["tesla"], cityId: "shanghai", address: l("浦东新区江山路 5000 号", "5000 Jiangshan Rd, Pudong"), hours: "09:00-20:00", phone: "021-6100-0202", services: [l("新车交付", "New vehicle delivery"), l("超级充电站", "Supercharger on site")] },
  { id: "sh-minhang-service", name: l("上海闵行服务中心", "Shanghai Minhang Service Centre"), type: "service", brands: ["xiaomi", "tesla"], cityId: "shanghai", address: l("闵行区申长路 1288 号", "1288 Shenchang Rd, Minhang"), hours: "08:30-18:30", phone: "021-6100-0203", services: [l("保养维修", "Maintenance & repair"), l("钣喷", "Body & paint"), l("移动服务", "Mobile service")] },
  { id: "sz-experience", name: l("深圳万象天地体验中心", "Shenzhen MixC World Experience Centre"), type: "experience", brands: ["xiaomi", "tesla"], cityId: "shenzhen", address: l("南山区深南大道 9668 号 L1", "L1, 9668 Shennan Blvd, Nanshan"), hours: "10:00-22:00", phone: "0755-8600-0300", services: [l("展车", "Display vehicles"), l("试驾", "Demo drives"), l("定制顾问", "Bespoke advisors")] },
  { id: "gz-experience", name: l("广州天环广场体验中心", "Guangzhou Parc Central Experience Centre"), type: "experience", brands: ["xiaomi", "tesla"], cityId: "guangzhou", address: l("天河区天河路 218 号 L1", "L1, 218 Tianhe Rd"), hours: "10:00-22:00", phone: "020-8700-0400", services: [l("展车", "Display vehicles"), l("试驾", "Demo drives")] },
  { id: "hz-flagship", name: l("杭州湖滨银泰联名旗舰店", "Hangzhou Hubin Intime Flagship"), type: "flagship", brands: ["xiaomi", "tesla"], cityId: "hangzhou", address: l("上城区延安路 258 号 in77 C 区", "Zone C, in77, 258 Yan'an Rd"), hours: "10:00-22:00", phone: "0571-8800-0500", services: [l("全系展车", "Full line-up on display"), l("定制工坊体验区", "Atelier studio"), l("试驾", "Demo drives")] },
  { id: "cd-experience", name: l("成都远洋太古里体验中心", "Chengdu Sino-Ocean Taikoo Li Experience Centre"), type: "experience", brands: ["xiaomi", "tesla"], cityId: "chengdu", address: l("锦江区中纱帽街 8 号", "8 Zhongshamao St, Jinjiang"), hours: "10:00-22:00", phone: "028-8600-0600", services: [l("展车", "Display vehicles"), l("试驾", "Demo drives"), l("交付", "Delivery")] },
  { id: "wh-experience", name: l("武汉武商梦时代体验中心", "Wuhan Wushang Dream Times Experience Centre"), type: "experience", brands: ["xiaomi", "tesla"], cityId: "wuhan", address: l("武昌区中南路 2 号", "2 Zhongnan Rd, Wuchang"), hours: "10:00-22:00", phone: "027-8700-0700", services: [l("展车", "Display vehicles"), l("试驾", "Demo drives")] },
  { id: "xa-experience", name: l("西安 SKP 体验中心", "Xi'an SKP Experience Centre"), type: "experience", brands: ["xiaomi", "tesla"], cityId: "xian", address: l("新城区长乐西路 261 号", "261 Changle West Rd, Xincheng"), hours: "10:00-22:00", phone: "029-8600-0800", services: [l("展车", "Display vehicles"), l("试驾", "Demo drives")] },
  { id: "nj-experience", name: l("南京德基广场体验中心", "Nanjing Deji Plaza Experience Centre"), type: "experience", brands: ["xiaomi", "tesla"], cityId: "nanjing", address: l("玄武区中山路 18 号 L4", "L4, 18 Zhongshan Rd, Xuanwu"), hours: "10:00-22:00", phone: "025-8600-0900", services: [l("展车", "Display vehicles"), l("试驾", "Demo drives")] },
  { id: "cq-experience", name: l("重庆光环购物公园体验中心", "Chongqing Paradise Walk Experience Centre"), type: "experience", brands: ["xiaomi", "tesla"], cityId: "chongqing", address: l("两江新区金渝大道 99 号", "99 Jinyu Ave, Liangjiang New Area"), hours: "10:00-22:00", phone: "023-8600-1000", services: [l("展车", "Display vehicles"), l("试驾", "Demo drives")] },
];

export interface AtelierProgram {
  id: string;
  title: L10n;
  summary: L10n;
  priceFrom: number;
  leadWeeks: [number, number];
  image: string;
  brands: ("xiaomi" | "tesla")[];
  includes: L10n[];
}

export const atelierPrograms: AtelierProgram[] = [
  {
    id: "signature-paint",
    title: l("联名限定车漆", "Signature Paint"),
    summary: l("由两大品牌色彩团队联合开发的 6 款限定色，多层珠光与哑光工艺，每色限量 300 台。", "Six limited colours co-developed by both brands' colour teams, in multi-layer pearl and matte finishes — 300 units per colour."),
    priceFrom: 28000,
    leadWeeks: [3, 5],
    image: "/images/atelier/paint.jpg",
    brands: ["xiaomi", "tesla"],
    includes: [l("限定色车漆与专属色卡编号", "Limited paint with numbered colour card"), l("同色卡钳与门槛饰条", "Colour-matched calipers and sill trims"), l("漆面 5 年质保 + 首年镀晶", "5-year paint warranty + first-year coating")],
  },
  {
    id: "bespoke-interior",
    title: l("手工内饰工坊", "Bespoke Interior"),
    summary: l("半苯胺真皮、Alcantara 与实木 / 碳纤维饰板自由组合，手工缝线与专属刺绣。", "Semi-aniline leather, Alcantara and wood or carbon décor in any combination, with hand stitching and personal embroidery."),
    priceFrom: 46000,
    leadWeeks: [4, 6],
    image: "/images/atelier/hero.jpg",
    brands: ["xiaomi", "tesla"],
    includes: [l("40+ 种皮革与缝线配色", "40+ leather and stitch colours"), l("头枕刺绣与专属铭牌", "Headrest embroidery and personal plaque"), l("定制部件 3 年质保", "3-year warranty on bespoke parts")],
  },
  {
    id: "carbon-program",
    title: l("碳纤维空气动力学套件", "Carbon Aero Program"),
    summary: l("前唇、侧裙、扩散器、尾翼与后视镜壳，干碳工艺，经风洞验证的官方套件。", "Splitter, sills, diffuser, wing and mirror caps in dry carbon — wind-tunnel validated official kits."),
    priceFrom: 68000,
    leadWeeks: [6, 8],
    image: "/images/atelier/carbon.jpg",
    brands: ["xiaomi", "tesla"],
    includes: [l("干碳部件与哑光 / 亮光可选", "Dry carbon parts in matte or gloss"), l("原厂标准安装与四轮定位", "Factory-standard fitting and alignment"), l("套件 3 年质保", "3-year kit warranty")],
  },
  {
    id: "delivery-ceremony",
    title: l("私享交付仪式", "Private Delivery Ceremony"),
    summary: l("旗舰店私享交付厅，专属揭幕、定制铭牌与影像纪念，家人朋友共同见证。", "A private delivery lounge at our flagship stores with a personal unveiling, plaque and film keepsake for you and your guests."),
    priceFrom: 0,
    leadWeeks: [0, 1],
    image: "/images/stores/hero.jpg",
    brands: ["xiaomi", "tesla"],
    includes: [l("定制工坊车主免费", "Complimentary for Atelier customers"), l("交付顾问全程陪同", "Dedicated delivery advisor"), l("交付影像与纪念册", "Delivery film and keepsake book")],
  },
];

export const atelierSteps = [
  { step: "01", title: l("预约顾问", "Book an advisor"), body: l("线上提交意向，24 小时内定制顾问联系您，确认车型与方向。", "Submit your interest online; an advisor calls within 24 hours to confirm vehicle and direction.") },
  { step: "02", title: l("到店设计", "Design in studio"), body: l("在旗舰店定制体验区实物比对色卡、皮革与碳纤维样件，生成 3D 效果图。", "Compare real colour cards, leathers and carbon samples in the studio and receive 3D renderings.") },
  { step: "03", title: l("锁定方案", "Lock the spec"), body: l("确认方案与报价，支付定制定金，同步至品牌官方排产。", "Confirm spec and quote, pay the bespoke deposit, and we sync to the brand's production system.") },
  { step: "04", title: l("认证工坊施工", "Certified workshop"), body: l("官方认证工坊按原厂标准施工，进度实时推送到您的账户。", "Certified workshops build to factory standards with progress updates in your account.") },
  { step: "05", title: l("私享交付", "Private delivery"), body: l("旗舰店私享交付厅揭幕，附定制证书与铭牌。", "Unveiled in a private delivery lounge with certificate and plaque.") },
];
