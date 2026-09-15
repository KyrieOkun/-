import { l, type L10n } from "@/lib/i18n/types";
import { corridorWaypoints } from "./corridors";

export interface City {
  id: string;
  name: L10n;
  province: L10n;
  lat: number;
  lng: number;
}

export const cities: City[] = [
  { id: "beijing", name: l("北京", "Beijing"), province: l("北京市", "Beijing"), lat: 39.9042, lng: 116.4074 },
  { id: "shanghai", name: l("上海", "Shanghai"), province: l("上海市", "Shanghai"), lat: 31.2304, lng: 121.4737 },
  { id: "guangzhou", name: l("广州", "Guangzhou"), province: l("广东省", "Guangdong"), lat: 23.1291, lng: 113.2644 },
  { id: "shenzhen", name: l("深圳", "Shenzhen"), province: l("广东省", "Guangdong"), lat: 22.5431, lng: 114.0579 },
  { id: "hangzhou", name: l("杭州", "Hangzhou"), province: l("浙江省", "Zhejiang"), lat: 30.2741, lng: 120.1551 },
  { id: "nanjing", name: l("南京", "Nanjing"), province: l("江苏省", "Jiangsu"), lat: 32.0603, lng: 118.7969 },
  { id: "suzhou", name: l("苏州", "Suzhou"), province: l("江苏省", "Jiangsu"), lat: 31.2989, lng: 120.5853 },
  { id: "chengdu", name: l("成都", "Chengdu"), province: l("四川省", "Sichuan"), lat: 30.5728, lng: 104.0668 },
  { id: "chongqing", name: l("重庆", "Chongqing"), province: l("重庆市", "Chongqing"), lat: 29.5630, lng: 106.5516 },
  { id: "wuhan", name: l("武汉", "Wuhan"), province: l("湖北省", "Hubei"), lat: 30.5928, lng: 114.3055 },
  { id: "xian", name: l("西安", "Xi'an"), province: l("陕西省", "Shaanxi"), lat: 34.3416, lng: 108.9398 },
  { id: "tianjin", name: l("天津", "Tianjin"), province: l("天津市", "Tianjin"), lat: 39.3434, lng: 117.3616 },
  { id: "changsha", name: l("长沙", "Changsha"), province: l("湖南省", "Hunan"), lat: 28.2282, lng: 112.9388 },
  { id: "zhengzhou", name: l("郑州", "Zhengzhou"), province: l("河南省", "Henan"), lat: 34.7466, lng: 113.6254 },
  { id: "jinan", name: l("济南", "Jinan"), province: l("山东省", "Shandong"), lat: 36.6512, lng: 117.1201 },
  { id: "qingdao", name: l("青岛", "Qingdao"), province: l("山东省", "Shandong"), lat: 36.0671, lng: 120.3826 },
  { id: "hefei", name: l("合肥", "Hefei"), province: l("安徽省", "Anhui"), lat: 31.8206, lng: 117.2272 },
  { id: "ningbo", name: l("宁波", "Ningbo"), province: l("浙江省", "Zhejiang"), lat: 29.8683, lng: 121.5440 },
  { id: "xiamen", name: l("厦门", "Xiamen"), province: l("福建省", "Fujian"), lat: 24.4798, lng: 118.0894 },
  { id: "fuzhou", name: l("福州", "Fuzhou"), province: l("福建省", "Fujian"), lat: 26.0745, lng: 119.2965 },
  { id: "kunming", name: l("昆明", "Kunming"), province: l("云南省", "Yunnan"), lat: 25.0389, lng: 102.7183 },
  { id: "guiyang", name: l("贵阳", "Guiyang"), province: l("贵州省", "Guizhou"), lat: 26.6470, lng: 106.6302 },
  { id: "nanchang", name: l("南昌", "Nanchang"), province: l("江西省", "Jiangxi"), lat: 28.6820, lng: 115.8579 },
  { id: "shenyang", name: l("沈阳", "Shenyang"), province: l("辽宁省", "Liaoning"), lat: 41.8057, lng: 123.4315 },
  { id: "dalian", name: l("大连", "Dalian"), province: l("辽宁省", "Liaoning"), lat: 38.9140, lng: 121.6147 },
  { id: "harbin", name: l("哈尔滨", "Harbin"), province: l("黑龙江省", "Heilongjiang"), lat: 45.8038, lng: 126.5350 },
  { id: "changchun", name: l("长春", "Changchun"), province: l("吉林省", "Jilin"), lat: 43.8171, lng: 125.3235 },
  { id: "shijiazhuang", name: l("石家庄", "Shijiazhuang"), province: l("河北省", "Hebei"), lat: 38.0428, lng: 114.5149 },
  { id: "taiyuan", name: l("太原", "Taiyuan"), province: l("山西省", "Shanxi"), lat: 37.8706, lng: 112.5489 },
  { id: "lanzhou", name: l("兰州", "Lanzhou"), province: l("甘肃省", "Gansu"), lat: 36.0611, lng: 103.8343 },
  { id: "urumqi", name: l("乌鲁木齐", "Ürümqi"), province: l("新疆维吾尔自治区", "Xinjiang"), lat: 43.8256, lng: 87.6168 },
  { id: "lhasa", name: l("拉萨", "Lhasa"), province: l("西藏自治区", "Xizang"), lat: 29.6520, lng: 91.1721 },
  { id: "nanning", name: l("南宁", "Nanning"), province: l("广西壮族自治区", "Guangxi"), lat: 22.8170, lng: 108.3665 },
  { id: "haikou", name: l("海口", "Haikou"), province: l("海南省", "Hainan"), lat: 20.0444, lng: 110.1999 },
  { id: "sanya", name: l("三亚", "Sanya"), province: l("海南省", "Hainan"), lat: 18.2528, lng: 109.5119 },
  { id: "hohhot", name: l("呼和浩特", "Hohhot"), province: l("内蒙古自治区", "Inner Mongolia"), lat: 40.8424, lng: 111.7490 },
  { id: "yinchuan", name: l("银川", "Yinchuan"), province: l("宁夏回族自治区", "Ningxia"), lat: 38.4872, lng: 106.2309 },
  { id: "xining", name: l("西宁", "Xining"), province: l("青海省", "Qinghai"), lat: 36.6171, lng: 101.7782 },
  { id: "wuxi", name: l("无锡", "Wuxi"), province: l("江苏省", "Jiangsu"), lat: 31.4912, lng: 120.3119 },
  { id: "dongguan", name: l("东莞", "Dongguan"), province: l("广东省", "Guangdong"), lat: 23.0207, lng: 113.7518 },
  { id: "foshan", name: l("佛山", "Foshan"), province: l("广东省", "Guangdong"), lat: 23.0218, lng: 113.1219 },
  { id: "zhuhai", name: l("珠海", "Zhuhai"), province: l("广东省", "Guangdong"), lat: 22.2710, lng: 113.5767 },
  { id: "huangshan", name: l("黄山", "Huangshan"), province: l("安徽省", "Anhui"), lat: 29.7147, lng: 118.3376 },
  { id: "lijiang", name: l("丽江", "Lijiang"), province: l("云南省", "Yunnan"), lat: 26.8721, lng: 100.2299 },
  { id: "dunhuang", name: l("敦煌", "Dunhuang"), province: l("甘肃省", "Gansu"), lat: 40.1421, lng: 94.6620 },
  { id: "xuzhou", name: l("徐州", "Xuzhou"), province: l("江苏省", "Jiangsu"), lat: 34.2044, lng: 117.2857 },
  { id: "jinhua", name: l("金华", "Jinhua"), province: l("浙江省", "Zhejiang"), lat: 29.0784, lng: 119.6474 },
  { id: "ganzhou", name: l("赣州", "Ganzhou"), province: l("江西省", "Jiangxi"), lat: 25.8452, lng: 114.9350 },
  { id: "shaoguan", name: l("韶关", "Shaoguan"), province: l("广东省", "Guangdong"), lat: 24.8108, lng: 113.5972 },
  { id: "yichang", name: l("宜昌", "Yichang"), province: l("湖北省", "Hubei"), lat: 30.6919, lng: 111.2865 },
  { id: "xiangyang", name: l("襄阳", "Xiangyang"), province: l("湖北省", "Hubei"), lat: 32.0090, lng: 112.1226 },
  { id: "baoding", name: l("保定", "Baoding"), province: l("河北省", "Hebei"), lat: 38.8740, lng: 115.4646 },
  { id: "dezhou", name: l("德州", "Dezhou"), province: l("山东省", "Shandong"), lat: 37.4341, lng: 116.3575 },
  { id: "cangzhou", name: l("沧州", "Cangzhou"), province: l("河北省", "Hebei"), lat: 38.3037, lng: 116.8387 },
  { id: "tai-an", name: l("泰安", "Tai'an"), province: l("山东省", "Shandong"), lat: 36.1943, lng: 117.0876 },
  { id: "huaian", name: l("淮安", "Huai'an"), province: l("江苏省", "Jiangsu"), lat: 33.6104, lng: 119.0153 },
  { id: "yueyang", name: l("岳阳", "Yueyang"), province: l("湖南省", "Hunan"), lat: 29.3572, lng: 113.1289 },
  { id: "hengyang", name: l("衡阳", "Hengyang"), province: l("湖南省", "Hunan"), lat: 26.8938, lng: 112.5719 },
  { id: "mianyang", name: l("绵阳", "Mianyang"), province: l("四川省", "Sichuan"), lat: 31.4675, lng: 104.6796 },
  { id: "hanzhong", name: l("汉中", "Hanzhong"), province: l("陕西省", "Shaanxi"), lat: 33.0677, lng: 107.0232 },
  { id: "luoyang", name: l("洛阳", "Luoyang"), province: l("河南省", "Henan"), lat: 34.6197, lng: 112.4540 },
  { id: "sanmenxia", name: l("三门峡", "Sanmenxia"), province: l("河南省", "Henan"), lat: 34.7732, lng: 111.2003 },
];

for (const [id, zh, en, provZh, provEn, lat, lng] of corridorWaypoints) {
  if (!cities.some((c) => c.id === id)) cities.push({ id, name: l(zh, en), province: l(provZh, provEn), lat, lng });
}

export const cityById: Record<string, City> = Object.fromEntries(cities.map((c) => [c.id, c]));

const EARTH_RADIUS_KM = 6371;

export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

/** Road distance approximation: great-circle × detour factor. */
export function roadDistanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  return haversineKm(a, b) * 1.22;
}
