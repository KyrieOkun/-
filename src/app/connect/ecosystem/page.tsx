import type { Metadata } from "next";
import Image from "next/image";
import { Check, Minus } from "lucide-react";
import { getI18n } from "@/lib/i18n/server";
import { Container, Eyebrow, SectionHeading } from "@/components/ui/primitives";
import { SceneBuilder } from "@/components/connect/scene-builder";
import { Icon } from "@/components/ui/icon";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.connect.ecosystemTitle, description: t.connect.ecosystemSubtitle, alternates: { canonical: "/connect/ecosystem" } };
}

export default async function EcosystemPage() {
  const { t, locale } = await getI18n();
  const zh = locale === "zh";

  const pillars = [
    { icon: "home", title: zh ? "人车家全生态" : "Human × Car × Home", body: zh ? "小米澎湃 OS 打通手机、汽车与米家设备，车辆位置与状态可作为米家场景触发条件。" : "HyperOS links phone, car and Mi Home; vehicle location and state can trigger home scenes." },
      { icon: "cpu", title: zh ? "Tesla App 事件桥接" : "Tesla App event bridge", body: zh ? "充电完成、哨兵告警、软件更新等 Tesla 事件实时推送到小米手机、手表与音箱。" : "Charging complete, Sentry alerts and software updates from Tesla are pushed to Xiaomi phones, watches and speakers." },
    { icon: "key-round", title: zh ? "穿戴设备解锁" : "Wearable unlock", body: zh ? "小米手表 / 手环 UWB 无感解锁两大品牌车辆，Apple Watch 与 iPhone 同样支持。" : "Xiaomi Watch / Band UWB unlock for both brands; Apple Watch and iPhone supported too." },
    { icon: "package", title: zh ? "CarIoT 配件生态" : "CarIoT accessories", body: zh ? "磁吸无线按键、1/4 英寸接口配件与后备厢电源轨，开放给两大品牌车主。" : "Magnetic wireless buttons, 1/4-inch mounts and the cargo power rail, open to owners of both brands." },
  ];

  const matrix: { feature: string; xiaomi: boolean | "partial"; tesla: boolean | "partial" }[] = [
    { feature: zh ? "米家场景触发（到家 / 离家）" : "Mi Home scenes (arrive / leave)", xiaomi: true, tesla: true },
    { feature: zh ? "手机 UWB 数字钥匙" : "Phone UWB digital key", xiaomi: true, tesla: true },
    { feature: zh ? "小米手表 / 手环钥匙" : "Xiaomi Watch / Band key", xiaomi: true, tesla: true },
    { feature: zh ? "Apple Watch / iPhone 钥匙" : "Apple Watch / iPhone key", xiaomi: true, tesla: true },
    { feature: zh ? "车内小爱同学控制米家" : "In-car XiaoAI for Mi Home", xiaomi: true, tesla: "partial" },
    { feature: zh ? "Tesla 事件推送到小米设备" : "Tesla events to Xiaomi devices", xiaomi: true, tesla: true },
    { feature: zh ? "CarPlay / 手机镜像" : "CarPlay / phone mirroring", xiaomi: true, tesla: "partial" },
    { feature: zh ? "CarIoT 磁吸配件" : "CarIoT magnetic accessories", xiaomi: true, tesla: "partial" },
    { feature: zh ? "谷电自动充电计划" : "Off-peak charging schedule", xiaomi: true, tesla: true },
    { feature: zh ? "统一账单与积分抵扣" : "One bill & points redemption", xiaomi: true, tesla: true },
  ];

  const Cell = ({ v }: { v: boolean | "partial" }) =>
    v === true ? <Check className="mx-auto size-4 text-success" /> : v === "partial" ? <span className="mx-auto block text-[11px] font-medium text-warning-deep">{zh ? "部分" : "Partial"}</span> : <Minus className="mx-auto size-4 text-ash" />;

  return (
    <div className="pt-14">
      <section className="border-b border-line bg-cloud">
        <Container className="py-12 lg:py-16">
          <Eyebrow className="mb-3">{t.connect.title}</Eyebrow>
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">{t.connect.ecosystemTitle}</h1>
          <p className="mt-4 max-w-2xl text-pretty text-base leading-7 text-graphite sm:text-lg">{t.connect.ecosystemSubtitle}</p>
        </Container>
      </section>

      <section className="py-16 lg:py-24">
        <Container className="grid items-center gap-12 lg:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-mist">
            <Image src="/images/connect/ecosystem.jpg" alt={t.connect.ecosystemTitle} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {pillars.map((p) => (
              <div key={p.title} className="rounded-3xl bg-white p-5 hairline">
                <span className="flex size-10 items-center justify-center rounded-2xl bg-mist"><Icon name={p.icon} className="size-5" /></span>
                <h2 className="mt-4 text-base font-semibold">{p.title}</h2>
                <p className="mt-2 text-sm leading-6 text-graphite">{p.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-cloud py-16 lg:py-24">
        <Container>
          <SectionHeading eyebrow={zh ? "场景编排" : "Scenes"} title={zh ? "如果…那么…" : "If this, then that"} subtitle={zh ? "用车辆事件触发家居，用家居习惯服务车辆。场景保存在您的账户中，并同步到小米汽车 App 与 Tesla App。" : "Let vehicle events drive your home and home routines serve your car. Scenes are saved to your account and synced to both apps."} />
          <div className="mt-10">
            <SceneBuilder />
          </div>
        </Container>
      </section>

      <section className="py-16 lg:py-24">
        <Container>
          <SectionHeading eyebrow={zh ? "兼容性" : "Compatibility"} title={zh ? "功能兼容矩阵" : "Feature matrix"} />
          <div className="mt-10 overflow-hidden rounded-3xl hairline">
            <table className="w-full text-sm">
              <thead className="bg-cloud text-left">
                <tr>
                  <th className="p-4 font-semibold">{zh ? "功能" : "Feature"}</th>
                  <th className="w-32 p-4 text-center font-semibold"><span className="inline-flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-mi" />{t.nav.xiaomi}</span></th>
                  <th className="w-32 p-4 text-center font-semibold"><span className="inline-flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-tesla" />{t.nav.tesla}</span></th>
                </tr>
              </thead>
              <tbody>
                {matrix.map((row, i) => (
                  <tr key={row.feature} className={i % 2 ? "bg-cloud/60" : "bg-white"}>
                    <td className="p-4 text-graphite">{row.feature}</td>
                    <td className="p-4"><Cell v={row.xiaomi} /></td>
                    <td className="p-4"><Cell v={row.tesla} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-ash">{zh ? "「部分」表示需通过手机中转或仅支持基础功能；具体以车辆软件版本为准。" : "'Partial' means relayed through the phone or basic functionality only; subject to vehicle software version."}</p>
        </Container>
      </section>
    </div>
  );
}
