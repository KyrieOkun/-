import { l, type L10n } from "@/lib/i18n/types";
import { cityById } from "./cities";
import { corridorWaypoints } from "./corridors";

export type Network = "tesla" | "xiaomi" | "partner";

export interface Station {
  id: string;
  name: L10n;
  network: Network;
  kind: L10n;
  cityId: string;
  address: L10n;
  stalls: number;
  maxKw: number;
  openToAll: boolean;
  amenities: string[];
  lat: number;
  lng: number;
  corridor?: string;
  hours: string;
  pricePerKwh: number;
}

const TESLA_V4 = l("特斯拉 V4 超级充电站", "Tesla V4 Supercharger");
const TESLA_V3 = l("特斯拉 V3 超级充电站", "Tesla V3 Supercharger");
const XIAOMI_600 = l("小米 600kW 液冷超充站", "Xiaomi 600 kW liquid-cooled Supercharger");
const PARTNER_480 = l("合作运营商液冷超充", "Partner liquid-cooled fast charger");

function at(cityId: string, dLat = 0, dLng = 0) {
  const c = cityById[cityId];
  return { lat: +(c.lat + dLat).toFixed(4), lng: +(c.lng + dLng).toFixed(4) };
}

export const stations: Station[] = [
  { id: "bj-wangjing-t", name: l("北京望京 SOHO 超级充电站", "Beijing Wangjing SOHO Supercharger"), network: "tesla", kind: TESLA_V4, cityId: "beijing", address: l("朝阳区望京街 10 号 B1 停车场", "B1 car park, 10 Wangjing St, Chaoyang"), stalls: 16, maxKw: 250, openToAll: true, amenities: ["wifi", "cafe", "restroom", "24h"], ...at("beijing", 0.09, 0.07), hours: "24h", pricePerKwh: 1.68 },
  { id: "bj-pinggu-t", name: l("北京平谷万达 V4 超级充电站", "Beijing Pinggu Wanda V4 Supercharger"), network: "tesla", kind: TESLA_V4, cityId: "beijing", address: l("平谷区平谷镇府前街万达广场", "Wanda Plaza, Fuqian St, Pinggu"), stalls: 6, maxKw: 250, openToAll: true, amenities: ["shopping", "restroom", "24h"], ...at("beijing", 0.24, 0.72), hours: "24h", pricePerKwh: 1.52 },
  { id: "bj-yizhuang-x", name: l("北京亦庄小米汽车工厂超充站", "Beijing Yizhuang Xiaomi EV Factory Supercharger"), network: "xiaomi", kind: XIAOMI_600, cityId: "beijing", address: l("北京经济技术开发区环景路 21 号", "21 Huanjing Rd, Beijing E-Town"), stalls: 12, maxKw: 600, openToAll: true, amenities: ["lounge", "wifi", "restroom", "24h"], ...at("beijing", -0.11, 0.1), hours: "24h", pricePerKwh: 1.45 },
  { id: "bj-guomao-x", name: l("北京国贸小米之家超充站", "Beijing Guomao Xiaomi Home Supercharger"), network: "xiaomi", kind: XIAOMI_600, cityId: "beijing", address: l("朝阳区建国门外大街 1 号国贸商城 B2", "B2 China World Mall, 1 Jianguomenwai Ave"), stalls: 8, maxKw: 600, openToAll: true, amenities: ["shopping", "cafe", "restroom"], ...at("beijing", 0.006, 0.05), hours: "07:00-23:00", pricePerKwh: 1.72 },
  { id: "bj-daxing-p", name: l("北京大兴机场合作超充站", "Beijing Daxing Airport Partner Fast Charger"), network: "partner", kind: PARTNER_480, cityId: "beijing", address: l("大兴国际机场 P2 停车楼", "P2 car park, Daxing International Airport"), stalls: 20, maxKw: 480, openToAll: true, amenities: ["restroom", "24h"], ...at("beijing", -0.4, 0.0), hours: "24h", pricePerKwh: 1.58 },
  { id: "sh-lujiazui-t", name: l("上海陆家嘴 IFC 超级充电站", "Shanghai Lujiazui IFC Supercharger"), network: "tesla", kind: TESLA_V3, cityId: "shanghai", address: l("浦东新区世纪大道 8 号国金中心 B3", "B3 IFC, 8 Century Ave, Pudong"), stalls: 20, maxKw: 250, openToAll: true, amenities: ["shopping", "cafe", "restroom"], ...at("shanghai", 0.01, 0.03), hours: "24h", pricePerKwh: 1.75 },
  { id: "sh-lingang-t", name: l("上海临港特斯拉超级工厂 V4 超充站", "Shanghai Lingang Gigafactory V4 Supercharger"), network: "tesla", kind: TESLA_V4, cityId: "shanghai", address: l("浦东新区江山路 5000 号", "5000 Jiangshan Rd, Pudong"), stalls: 40, maxKw: 250, openToAll: true, amenities: ["lounge", "restroom", "24h"], ...at("shanghai", -0.35, 0.45), hours: "24h", pricePerKwh: 1.42 },
  { id: "sh-xujiahui-x", name: l("上海徐家汇小米超充站", "Shanghai Xujiahui Xiaomi Supercharger"), network: "xiaomi", kind: XIAOMI_600, cityId: "shanghai", address: l("徐汇区肇嘉浜路 1111 号美罗城 B2", "B2 Metro City, 1111 Zhaojiabang Rd, Xuhui"), stalls: 10, maxKw: 600, openToAll: true, amenities: ["shopping", "cafe", "restroom"], ...at("shanghai", -0.04, -0.04), hours: "24h", pricePerKwh: 1.7 },
  { id: "sh-hongqiao-x", name: l("上海虹桥枢纽小米超充站", "Shanghai Hongqiao Hub Xiaomi Supercharger"), network: "xiaomi", kind: XIAOMI_600, cityId: "shanghai", address: l("闵行区申贵路 1500 号 P6 停车场", "P6 car park, 1500 Shengui Rd, Minhang"), stalls: 16, maxKw: 600, openToAll: true, amenities: ["restroom", "24h"], ...at("shanghai", -0.03, -0.15), hours: "24h", pricePerKwh: 1.6 },
  { id: "hz-westlake-x", name: l("杭州西湖天地小米超充站", "Hangzhou West Lake Xiaomi Supercharger"), network: "xiaomi", kind: XIAOMI_600, cityId: "hangzhou", address: l("上城区南山路 147 号西湖天地停车场", "West Lake Tiandi car park, 147 Nanshan Rd"), stalls: 8, maxKw: 600, openToAll: true, amenities: ["cafe", "restroom"], ...at("hangzhou", -0.02, 0.0), hours: "24h", pricePerKwh: 1.65 },
  { id: "hz-binjiang-t", name: l("杭州滨江宝龙城 V4 超级充电站", "Hangzhou Binjiang Powerlong V4 Supercharger"), network: "tesla", kind: TESLA_V4, cityId: "hangzhou", address: l("滨江区江南大道 228 号", "228 Jiangnan Ave, Binjiang"), stalls: 12, maxKw: 250, openToAll: true, amenities: ["shopping", "restroom", "24h"], ...at("hangzhou", -0.07, 0.05), hours: "24h", pricePerKwh: 1.62 },
  { id: "nj-xinjiekou-t", name: l("南京新街口德基广场超级充电站", "Nanjing Xinjiekou Deji Plaza Supercharger"), network: "tesla", kind: TESLA_V3, cityId: "nanjing", address: l("玄武区中山路 18 号 B4", "B4, 18 Zhongshan Rd, Xuanwu"), stalls: 12, maxKw: 250, openToAll: true, amenities: ["shopping", "cafe"], ...at("nanjing", 0.0, 0.0), hours: "24h", pricePerKwh: 1.7 },
  { id: "sz-nanshan-x", name: l("深圳南山小米超充站", "Shenzhen Nanshan Xiaomi Supercharger"), network: "xiaomi", kind: XIAOMI_600, cityId: "shenzhen", address: l("南山区深南大道 9678 号大冲商务中心", "Dachong Business Centre, 9678 Shennan Blvd"), stalls: 12, maxKw: 600, openToAll: true, amenities: ["cafe", "restroom", "24h"], ...at("shenzhen", 0.01, -0.1), hours: "24h", pricePerKwh: 1.68 },
  { id: "sz-futian-t", name: l("深圳福田 COCO Park 超级充电站", "Shenzhen Futian COCO Park Supercharger"), network: "tesla", kind: TESLA_V4, cityId: "shenzhen", address: l("福田区福华三路 269 号 B2", "B2, 269 Fuhua 3rd Rd, Futian"), stalls: 14, maxKw: 250, openToAll: true, amenities: ["shopping", "restroom"], ...at("shenzhen", 0.0, 0.0), hours: "24h", pricePerKwh: 1.72 },
  { id: "gz-tianhe-t", name: l("广州天河太古汇超级充电站", "Guangzhou Tianhe Taikoo Hui Supercharger"), network: "tesla", kind: TESLA_V3, cityId: "guangzhou", address: l("天河区天河路 383 号 B3", "B3, 383 Tianhe Rd"), stalls: 10, maxKw: 250, openToAll: true, amenities: ["shopping", "cafe"], ...at("guangzhou", 0.01, 0.06), hours: "24h", pricePerKwh: 1.7 },
  { id: "gz-baiyun-x", name: l("广州白云机场小米超充站", "Guangzhou Baiyun Airport Xiaomi Supercharger"), network: "xiaomi", kind: XIAOMI_600, cityId: "guangzhou", address: l("白云国际机场 T2 P7 停车场", "P7 car park, Terminal 2, Baiyun Airport"), stalls: 16, maxKw: 600, openToAll: true, amenities: ["restroom", "24h"], ...at("guangzhou", 0.26, 0.04), hours: "24h", pricePerKwh: 1.55 },
  { id: "cd-taikooli-t", name: l("成都太古里超级充电站", "Chengdu Taikoo Li Supercharger"), network: "tesla", kind: TESLA_V3, cityId: "chengdu", address: l("锦江区中纱帽街 8 号 B2", "B2, 8 Zhongshamao St, Jinjiang"), stalls: 12, maxKw: 250, openToAll: true, amenities: ["shopping", "cafe"], ...at("chengdu", 0.08, 0.01), hours: "24h", pricePerKwh: 1.62 },
  { id: "cd-tianfu-x", name: l("成都天府新区小米超充站", "Chengdu Tianfu New Area Xiaomi Supercharger"), network: "xiaomi", kind: XIAOMI_600, cityId: "chengdu", address: l("天府新区天府大道南段 888 号", "888 Tianfu Ave South"), stalls: 12, maxKw: 600, openToAll: true, amenities: ["lounge", "restroom", "24h"], ...at("chengdu", -0.15, 0.02), hours: "24h", pricePerKwh: 1.5 },
  { id: "cq-jiefangbei-t", name: l("重庆解放碑 V4 超级充电站", "Chongqing Jiefangbei V4 Supercharger"), network: "tesla", kind: TESLA_V4, cityId: "chongqing", address: l("渝中区民族路 188 号 B3", "B3, 188 Minzu Rd, Yuzhong"), stalls: 8, maxKw: 250, openToAll: true, amenities: ["shopping", "restroom"], ...at("chongqing", 0.0, 0.02), hours: "24h", pricePerKwh: 1.66 },
  { id: "wh-guanggu-x", name: l("武汉光谷小米超充站", "Wuhan Optics Valley Xiaomi Supercharger"), network: "xiaomi", kind: XIAOMI_600, cityId: "wuhan", address: l("东湖高新区珞喻路 726 号", "726 Luoyu Rd, East Lake High-tech Zone"), stalls: 10, maxKw: 600, openToAll: true, amenities: ["cafe", "restroom", "24h"], ...at("wuhan", -0.09, 0.12), hours: "24h", pricePerKwh: 1.55 },
  { id: "wh-hanjie-t", name: l("武汉楚河汉街超级充电站", "Wuhan Han Street Supercharger"), network: "tesla", kind: TESLA_V3, cityId: "wuhan", address: l("武昌区中北路 1 号 B2", "B2, 1 Zhongbei Rd, Wuchang"), stalls: 12, maxKw: 250, openToAll: true, amenities: ["shopping", "cafe"], ...at("wuhan", -0.03, 0.05), hours: "24h", pricePerKwh: 1.62 },
  { id: "xa-datang-t", name: l("西安大唐不夜城超级充电站", "Xi'an Datang Everbright City Supercharger"), network: "tesla", kind: TESLA_V3, cityId: "xian", address: l("雁塔区慈恩路 B2 停车场", "B2 car park, Ci'en Rd, Yanta"), stalls: 10, maxKw: 250, openToAll: true, amenities: ["shopping", "restroom"], ...at("xian", -0.12, 0.02), hours: "24h", pricePerKwh: 1.6 },
  { id: "xa-gaoxin-x", name: l("西安高新小米超充站", "Xi'an Hi-tech Zone Xiaomi Supercharger"), network: "xiaomi", kind: XIAOMI_600, cityId: "xian", address: l("高新区锦业路 1 号", "1 Jinye Rd, Hi-tech Zone"), stalls: 8, maxKw: 600, openToAll: true, amenities: ["cafe", "restroom", "24h"], ...at("xian", -0.14, -0.06), hours: "24h", pricePerKwh: 1.5 },
  { id: "tj-binhai-t", name: l("天津滨海文化中心超级充电站", "Tianjin Binhai Cultural Centre Supercharger"), network: "tesla", kind: TESLA_V3, cityId: "tianjin", address: l("滨海新区旭升路 347 号", "347 Xusheng Rd, Binhai"), stalls: 8, maxKw: 250, openToAll: true, amenities: ["restroom", "24h"], ...at("tianjin", -0.3, 0.35), hours: "24h", pricePerKwh: 1.58 },
  { id: "cs-ifs-t", name: l("长沙 IFS 国金中心超级充电站", "Changsha IFS Supercharger"), network: "tesla", kind: TESLA_V3, cityId: "changsha", address: l("芙蓉区解放西路 188 号 B4", "B4, 188 Jiefang West Rd, Furong"), stalls: 10, maxKw: 250, openToAll: true, amenities: ["shopping", "cafe"], ...at("changsha", 0.0, 0.03), hours: "24h", pricePerKwh: 1.62 },
  { id: "zz-cbd-x", name: l("郑州郑东 CBD 小米超充站", "Zhengzhou Zhengdong CBD Xiaomi Supercharger"), network: "xiaomi", kind: XIAOMI_600, cityId: "zhengzhou", address: l("郑东新区商务内环路 9 号", "9 Shangwu Inner Ring Rd, Zhengdong"), stalls: 8, maxKw: 600, openToAll: true, amenities: ["cafe", "restroom", "24h"], ...at("zhengzhou", 0.01, 0.1), hours: "24h", pricePerKwh: 1.48 },
  { id: "jn-quancheng-t", name: l("济南泉城广场超级充电站", "Jinan Quancheng Square Supercharger"), network: "tesla", kind: TESLA_V3, cityId: "jinan", address: l("历下区泺源大街 1 号", "1 Luoyuan St, Lixia"), stalls: 8, maxKw: 250, openToAll: true, amenities: ["restroom"], ...at("jinan", 0.0, 0.0), hours: "24h", pricePerKwh: 1.6 },
  { id: "qd-may4-x", name: l("青岛五四广场小米超充站", "Qingdao May Fourth Square Xiaomi Supercharger"), network: "xiaomi", kind: XIAOMI_600, cityId: "qingdao", address: l("市南区东海西路 35 号", "35 Donghai West Rd, Shinan"), stalls: 8, maxKw: 600, openToAll: true, amenities: ["cafe", "restroom"], ...at("qingdao", 0.0, 0.0), hours: "24h", pricePerKwh: 1.55 },
  { id: "hf-swan-t", name: l("合肥天鹅湖万达超级充电站", "Hefei Swan Lake Wanda Supercharger"), network: "tesla", kind: TESLA_V3, cityId: "hefei", address: l("蜀山区潜山路 100 号", "100 Qianshan Rd, Shushan"), stalls: 8, maxKw: 250, openToAll: true, amenities: ["shopping"], ...at("hefei", 0.0, -0.03), hours: "24h", pricePerKwh: 1.58 },
  { id: "xm-siming-x", name: l("厦门思明小米超充站", "Xiamen Siming Xiaomi Supercharger"), network: "xiaomi", kind: XIAOMI_600, cityId: "xiamen", address: l("思明区演武西路 180 号", "180 Yanwu West Rd, Siming"), stalls: 6, maxKw: 600, openToAll: true, amenities: ["cafe"], ...at("xiamen", 0.0, 0.0), hours: "24h", pricePerKwh: 1.6 },
  { id: "km-dianchi-t", name: l("昆明滇池国际会展超级充电站", "Kunming Dianchi Expo Supercharger"), network: "tesla", kind: TESLA_V3, cityId: "kunming", address: l("官渡区滇池路 1 号", "1 Dianchi Rd, Guandu"), stalls: 8, maxKw: 250, openToAll: true, amenities: ["restroom", "24h"], ...at("kunming", -0.06, 0.03), hours: "24h", pricePerKwh: 1.5 },
  { id: "sy-hunnan-t", name: l("沈阳浑南 K11 超级充电站", "Shenyang Hunnan K11 Supercharger"), network: "tesla", kind: TESLA_V3, cityId: "shenyang", address: l("浑南区营盘北街 7 号", "7 Yingpan North St, Hunnan"), stalls: 8, maxKw: 250, openToAll: true, amenities: ["shopping"], ...at("shenyang", -0.05, 0.05), hours: "24h", pricePerKwh: 1.55 },
  { id: "hk-meilan-x", name: l("海口美兰机场小米超充站", "Haikou Meilan Airport Xiaomi Supercharger"), network: "xiaomi", kind: XIAOMI_600, cityId: "haikou", address: l("美兰国际机场 T2 P3 停车场", "P3, Terminal 2, Meilan Airport"), stalls: 8, maxKw: 600, openToAll: true, amenities: ["restroom", "24h"], ...at("haikou", -0.1, 0.25), hours: "24h", pricePerKwh: 1.5 },
  // Highway corridor stations (service areas)
  { id: "sa-dezhou", name: l("京沪高速德州服务区超充站", "G2 Dezhou Service Area Supercharger"), network: "partner", kind: PARTNER_480, cityId: "dezhou", address: l("G2 京沪高速德州服务区（双向）", "G2 Beijing–Shanghai Expressway, Dezhou SA (both directions)"), stalls: 16, maxKw: 480, openToAll: true, amenities: ["restroom", "food", "24h"], ...at("dezhou"), corridor: "G2", hours: "24h", pricePerKwh: 1.7 },
  { id: "sa-cangzhou-t", name: l("京沪高速沧州服务区 V4 超充站", "G2 Cangzhou Service Area V4 Supercharger"), network: "tesla", kind: TESLA_V4, cityId: "cangzhou", address: l("G2 京沪高速沧州服务区", "G2, Cangzhou SA"), stalls: 8, maxKw: 250, openToAll: true, amenities: ["restroom", "food", "24h"], ...at("cangzhou"), corridor: "G2", hours: "24h", pricePerKwh: 1.75 },
  { id: "sa-taian-x", name: l("京台高速泰安服务区小米超充站", "G3 Tai'an Service Area Xiaomi Supercharger"), network: "xiaomi", kind: XIAOMI_600, cityId: "tai-an", address: l("G3 京台高速泰安服务区", "G3, Tai'an SA"), stalls: 8, maxKw: 600, openToAll: true, amenities: ["restroom", "food", "24h"], ...at("tai-an"), corridor: "G3", hours: "24h", pricePerKwh: 1.72 },
  { id: "sa-xuzhou-t", name: l("京沪高速徐州服务区超充站", "G2 Xuzhou Service Area Supercharger"), network: "tesla", kind: TESLA_V3, cityId: "xuzhou", address: l("G2 京沪高速徐州东服务区", "G2, Xuzhou East SA"), stalls: 8, maxKw: 250, openToAll: true, amenities: ["restroom", "food", "24h"], ...at("xuzhou"), corridor: "G2", hours: "24h", pricePerKwh: 1.75 },
  { id: "sa-huaian-x", name: l("长深高速淮安服务区小米超充站", "G25 Huai'an Service Area Xiaomi Supercharger"), network: "xiaomi", kind: XIAOMI_600, cityId: "huaian", address: l("G25 长深高速淮安服务区", "G25, Huai'an SA"), stalls: 8, maxKw: 600, openToAll: true, amenities: ["restroom", "food", "24h"], ...at("huaian"), corridor: "G2", hours: "24h", pricePerKwh: 1.72 },
  { id: "sa-jinhua-x", name: l("沪昆高速金华服务区小米超充站", "G60 Jinhua Service Area Xiaomi Supercharger"), network: "xiaomi", kind: XIAOMI_600, cityId: "jinhua", address: l("G60 沪昆高速金华服务区", "G60, Jinhua SA"), stalls: 8, maxKw: 600, openToAll: true, amenities: ["restroom", "food", "24h"], ...at("jinhua"), corridor: "G60", hours: "24h", pricePerKwh: 1.72 },
  { id: "sa-nanchang-t", name: l("沪昆高速南昌服务区超充站", "G60 Nanchang Service Area Supercharger"), network: "tesla", kind: TESLA_V3, cityId: "nanchang", address: l("G60 沪昆高速南昌东服务区", "G60, Nanchang East SA"), stalls: 8, maxKw: 250, openToAll: true, amenities: ["restroom", "food", "24h"], ...at("nanchang", 0.05, 0.1), corridor: "G60", hours: "24h", pricePerKwh: 1.75 },
  { id: "sa-yueyang-t", name: l("京港澳高速岳阳服务区超充站", "G4 Yueyang Service Area Supercharger"), network: "tesla", kind: TESLA_V3, cityId: "yueyang", address: l("G4 京港澳高速岳阳服务区", "G4, Yueyang SA"), stalls: 8, maxKw: 250, openToAll: true, amenities: ["restroom", "food", "24h"], ...at("yueyang"), corridor: "G4", hours: "24h", pricePerKwh: 1.75 },
  { id: "sa-hengyang-x", name: l("京港澳高速衡阳服务区小米超充站", "G4 Hengyang Service Area Xiaomi Supercharger"), network: "xiaomi", kind: XIAOMI_600, cityId: "hengyang", address: l("G4 京港澳高速衡阳服务区", "G4, Hengyang SA"), stalls: 8, maxKw: 600, openToAll: true, amenities: ["restroom", "food", "24h"], ...at("hengyang"), corridor: "G4", hours: "24h", pricePerKwh: 1.72 },
  { id: "sa-shaoguan-t", name: l("京港澳高速韶关服务区 V4 超充站", "G4 Shaoguan Service Area V4 Supercharger"), network: "tesla", kind: TESLA_V4, cityId: "shaoguan", address: l("G4 京港澳高速韶关服务区", "G4, Shaoguan SA"), stalls: 8, maxKw: 250, openToAll: true, amenities: ["restroom", "food", "24h"], ...at("shaoguan"), corridor: "G4", hours: "24h", pricePerKwh: 1.75 },
  { id: "sa-ganzhou-p", name: l("大广高速赣州服务区超充站", "G45 Ganzhou Service Area Fast Charger"), network: "partner", kind: PARTNER_480, cityId: "ganzhou", address: l("G45 大广高速赣州服务区", "G45, Ganzhou SA"), stalls: 12, maxKw: 480, openToAll: true, amenities: ["restroom", "food", "24h"], ...at("ganzhou"), corridor: "G45", hours: "24h", pricePerKwh: 1.7 },
  { id: "sa-xiangyang-x", name: l("福银高速襄阳服务区小米超充站", "G70 Xiangyang Service Area Xiaomi Supercharger"), network: "xiaomi", kind: XIAOMI_600, cityId: "xiangyang", address: l("G70 福银高速襄阳服务区", "G70, Xiangyang SA"), stalls: 8, maxKw: 600, openToAll: true, amenities: ["restroom", "food", "24h"], ...at("xiangyang"), corridor: "G70", hours: "24h", pricePerKwh: 1.72 },
  { id: "sa-yichang-t", name: l("沪渝高速宜昌服务区超充站", "G50 Yichang Service Area Supercharger"), network: "tesla", kind: TESLA_V3, cityId: "yichang", address: l("G50 沪渝高速宜昌服务区", "G50, Yichang SA"), stalls: 8, maxKw: 250, openToAll: true, amenities: ["restroom", "food", "24h"], ...at("yichang"), corridor: "G50", hours: "24h", pricePerKwh: 1.75 },
  { id: "sa-luoyang-t", name: l("连霍高速洛阳服务区超充站", "G30 Luoyang Service Area Supercharger"), network: "tesla", kind: TESLA_V3, cityId: "luoyang", address: l("G30 连霍高速洛阳服务区", "G30, Luoyang SA"), stalls: 8, maxKw: 250, openToAll: true, amenities: ["restroom", "food", "24h"], ...at("luoyang"), corridor: "G30", hours: "24h", pricePerKwh: 1.75 },
  { id: "sa-sanmenxia-x", name: l("连霍高速三门峡服务区小米超充站", "G30 Sanmenxia Service Area Xiaomi Supercharger"), network: "xiaomi", kind: XIAOMI_600, cityId: "sanmenxia", address: l("G30 连霍高速三门峡服务区", "G30, Sanmenxia SA"), stalls: 8, maxKw: 600, openToAll: true, amenities: ["restroom", "food", "24h"], ...at("sanmenxia"), corridor: "G30", hours: "24h", pricePerKwh: 1.72 },
  { id: "sa-mianyang-p", name: l("京昆高速绵阳服务区超充站", "G5 Mianyang Service Area Fast Charger"), network: "partner", kind: PARTNER_480, cityId: "mianyang", address: l("G5 京昆高速绵阳服务区", "G5, Mianyang SA"), stalls: 12, maxKw: 480, openToAll: true, amenities: ["restroom", "food", "24h"], ...at("mianyang"), corridor: "G5", hours: "24h", pricePerKwh: 1.7 },
  { id: "sa-hanzhong-t", name: l("京昆高速汉中服务区超充站", "G5 Hanzhong Service Area Supercharger"), network: "tesla", kind: TESLA_V3, cityId: "hanzhong", address: l("G5 京昆高速汉中服务区", "G5, Hanzhong SA"), stalls: 8, maxKw: 250, openToAll: true, amenities: ["restroom", "food", "24h"], ...at("hanzhong"), corridor: "G5", hours: "24h", pricePerKwh: 1.75 },
  { id: "sa-baoding-x", name: l("京港澳高速保定服务区小米超充站", "G4 Baoding Service Area Xiaomi Supercharger"), network: "xiaomi", kind: XIAOMI_600, cityId: "baoding", address: l("G4 京港澳高速保定服务区", "G4, Baoding SA"), stalls: 8, maxKw: 600, openToAll: true, amenities: ["restroom", "food", "24h"], ...at("baoding"), corridor: "G4", hours: "24h", pricePerKwh: 1.72 },
  { id: "sa-huangshan-t", name: l("京台高速黄山服务区超充站", "G3 Huangshan Service Area Supercharger"), network: "tesla", kind: TESLA_V3, cityId: "huangshan", address: l("G3 京台高速黄山服务区", "G3, Huangshan SA"), stalls: 8, maxKw: 250, openToAll: true, amenities: ["restroom", "food", "24h"], ...at("huangshan"), corridor: "G3", hours: "24h", pricePerKwh: 1.75 },
];

const KIND_BY_NETWORK: Record<Network, L10n> = { tesla: TESLA_V3, xiaomi: XIAOMI_600, partner: PARTNER_480 };

for (const [cityId, zh, en, , , lat, lng, corridor, network, maxKw, stalls] of corridorWaypoints) {
  const id = `sa-${cityId}-${network[0]}`;
  if (stations.some((s) => s.id === id)) continue;
  const label = network === "tesla" ? l("超级充电站", "Supercharger") : network === "xiaomi" ? l("小米超充站", "Xiaomi Supercharger") : l("超充站", "Fast Charger");
  stations.push({
    id,
    name: l(`${corridor} ${zh}服务区${label.zh}`, `${corridor} ${en} Service Area ${label.en}`),
    network,
    kind: KIND_BY_NETWORK[network],
    cityId,
    address: l(`${corridor} 高速${zh}服务区（双向）`, `${corridor} Expressway, ${en} SA (both directions)`),
    stalls,
    maxKw,
    openToAll: true,
    amenities: ["restroom", "food", "24h"],
    lat,
    lng,
    corridor,
    hours: "24h",
    pricePerKwh: network === "xiaomi" ? 1.72 : network === "tesla" ? 1.75 : 1.7,
  });
}

// Every major city gets at least one urban supercharger so that trip planning
// can rely on city nodes as well as highway service areas.
const CITY_FALLBACK_NETWORKS: Network[] = ["xiaomi", "tesla", "partner"];
Object.values(cityById).forEach((city, i) => {
  if (stations.some((s) => s.cityId === city.id && !s.corridor)) return;
  const network = CITY_FALLBACK_NETWORKS[i % CITY_FALLBACK_NETWORKS.length];
  const label = network === "tesla" ? l("超级充电站", "Supercharger") : network === "xiaomi" ? l("小米超充站", "Xiaomi Supercharger") : l("合作超充站", "Partner Fast Charger");
  stations.push({
    id: `city-${city.id}-${network[0]}`,
    name: l(`${city.name.zh}市区${label.zh}`, `${city.name.en} City ${label.en}`),
    network,
    kind: KIND_BY_NETWORK[network],
    cityId: city.id,
    address: l(`${city.name.zh}市中心商业区停车场`, `${city.name.en} central business district car park`),
    stalls: network === "tesla" ? 8 : network === "xiaomi" ? 8 : 12,
    maxKw: network === "tesla" ? 250 : network === "xiaomi" ? 600 : 480,
    openToAll: true,
    amenities: ["restroom", "shopping"],
    lat: +(city.lat + 0.01).toFixed(4),
    lng: +(city.lng + 0.01).toFixed(4),
    hours: "24h",
    pricePerKwh: network === "xiaomi" ? 1.6 : network === "tesla" ? 1.66 : 1.58,
  });
});

export const networkStats = [
  { id: "tesla-stations", value: "2,100+", label: l("特斯拉超级充电站（中国大陆）", "Tesla Supercharger stations (mainland China)") },
  { id: "tesla-stalls", value: "12,000+", label: l("特斯拉超级充电桩", "Tesla Supercharger stalls") },
  { id: "tesla-open", value: "1,000+", label: l("向非特斯拉车辆开放的超充站", "Superchargers open to non-Tesla EVs") },
  { id: "xiaomi-map", value: "170万+", valueEn: "1.7M+", label: l("小米充电地图接入充电桩", "Stalls on the Xiaomi charging map") },
  { id: "xiaomi-fast", value: "17万+", valueEn: "170k+", label: l("其中超充桩", "of which superchargers") },
  { id: "service-areas", value: "7,822", label: l("已覆盖高速服务区", "Highway service areas covered") },
];

export const homeChargers = [
  {
    id: "xiaomi-7",
    brand: "xiaomi" as const,
    name: l("小米家用充电桩 7 kW", "Xiaomi Wall Connector 7 kW"),
    price: 3999,
    note: l("购车赠送并含基础安装服务", "Included with vehicle purchase, with standard installation"),
    bullets: [l("770 g 超轻充电枪", "770 g lightweight plug"), l("蓝牙靠近自动解锁", "Bluetooth proximity unlock"), l("米家 App 远程管理", "Mi Home app control")],
  },
  {
    id: "xiaomi-11",
    brand: "xiaomi" as const,
    name: l("小米家用充电桩 11 kW", "Xiaomi Wall Connector 11 kW"),
    price: 5999,
    note: l("三相电，约 9 小时充满 101.7 kWh", "Three-phase; ~9 h for 101.7 kWh"),
    bullets: [l("400 × 180 × 120 mm 轻巧机身", "Compact 400 × 180 × 120 mm body"), l("支持预约充电与谷电", "Scheduled and off-peak charging"), l("IP66 防护", "IP66 rated")],
  },
  {
    id: "tesla-gen3",
    brand: "tesla" as const,
    name: l("特斯拉第三代壁挂式充电连接器", "Tesla Gen 3 Wall Connector"),
    price: 4800,
    note: l("家庭充电服务包含标准安装", "Standard installation included in the home charging package"),
    bullets: [l("最高 11 kW 交流", "Up to 11 kW AC"), l("多台功率分配", "Power sharing across units"), l("Tesla App 远程监控", "Tesla app monitoring")],
  },
];

export const chargingBenefits = [
  { icon: "plug-zap", title: l("即插即充", "Plug & Charge"), body: l("插枪即识别车辆身份并开始充电，无需扫码或刷卡。", "Plug in and charging starts — no QR codes or cards.") },
  { icon: "wallet", title: l("统一账单", "One bill"), body: l("特斯拉、小米与合作网络费用汇总为一张账单，一次开票。", "Tesla, Xiaomi and partner charging on a single bill with one invoice.") },
  { icon: "map-pinned", title: l("实时可用率", "Live availability"), body: l("站点空闲桩、排队与功率实时可见，行程中自动推荐。", "See free stalls, queues and live power, with en-route suggestions.") },
  { icon: "badge-percent", title: l("会员权益", "Member benefits"), body: l("分时电价、停车费减免与小米积分抵扣服务费。", "Time-of-use rates, parking waivers and Xiaomi points toward service fees.") },
];

/** Slim projection for the schematic map (client component); coordinates rounded to ~100 m. */
export function toMapStation(s: Station): Pick<Station, "id" | "name" | "network" | "lat" | "lng" | "maxKw" | "cityId"> {
  return { id: s.id, name: s.name, network: s.network, lat: Math.round(s.lat * 1000) / 1000, lng: Math.round(s.lng * 1000) / 1000, maxKw: s.maxKw, cityId: s.cityId };
}
