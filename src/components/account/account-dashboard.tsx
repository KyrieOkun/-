"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, Link2, LogOut, ShieldCheck, Unlink } from "lucide-react";
import type { Vehicle } from "@/data/types";
import type { OrderRecord } from "@/lib/orders";
import type { PublicUser } from "@/lib/auth";
import { apiFetch } from "@/lib/client";
import { useI18n } from "@/lib/i18n/provider";
import { cn, formatCNY, formatDateTime, maskPhone } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/primitives";
import { useUser } from "@/components/auth/auth-gate";

export function AccountDashboard({ vehicles }: { vehicles: Vehicle[] }) {
  const { t, pick, locale } = useI18n();
  const { user, setUser } = useUser();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [linking, setLinking] = useState<"xiaomi" | "tesla" | null>(null);

  const load = useCallback(async () => {
    const res = await apiFetch<{ orders: OrderRecord[] }>("/api/orders");
    setOrders(res.data?.orders ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function toggleLink(provider: "xiaomi" | "tesla") {
    if (!user) return;
    setLinking(provider);
    const res = await apiFetch<{ user: PublicUser }>("/api/auth/link", { method: "POST", json: { provider, linked: !user.linkedAccounts[provider] } });
    setLinking(null);
    if (res.ok && res.data) setUser(res.data.user);
  }

  async function logout() {
    await apiFetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.refresh();
    router.push("/");
  }

  if (!user) return null;
  const statusLabel = { pending: t.order.statusPending, paid: t.order.statusPaid, production: t.order.statusProduction, delivered: t.order.statusDelivered } as const;

  return (
    <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
      <aside className="space-y-4">
        <div className="rounded-3xl bg-ink p-6 text-white">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/60">{t.account.oneIdTitle}</p>
          <h2 className="mt-2 text-2xl font-semibold">{user.name}</h2>
          <p className="mt-1 text-sm text-white/70">{user.phone ? maskPhone(user.phone) : user.email}</p>
          <p className="mt-4 text-xs text-white/60">{locale === "zh" ? "注册于" : "Member since"} {formatDateTime(user.createdAt, locale)}</p>
          <Button variant="glass" size="sm" className="mt-5" onClick={logout} icon={<LogOut className="size-4" />}>{t.nav.logout}</Button>
        </div>

        <div className="rounded-3xl bg-white p-6 hairline">
          <h3 className="flex items-center gap-2 font-semibold"><ShieldCheck className="size-4" />{locale === "zh" ? "账号绑定" : "Linked accounts"}</h3>
          <p className="mt-1 text-xs text-slate">{t.account.oneIdBody}</p>
          <div className="mt-4 space-y-3">
            {(["xiaomi", "tesla"] as const).map((p) => {
              const linked = user.linkedAccounts[p];
              return (
                <div key={p} className="flex items-center justify-between rounded-2xl bg-cloud p-3">
                  <div className="flex items-center gap-2">
                    <span className={cn("size-2 rounded-full", p === "xiaomi" ? "bg-mi" : "bg-tesla")} />
                    <div>
                      <p className="text-sm font-medium">{p === "xiaomi" ? (locale === "zh" ? "小米账号" : "Xiaomi Account") : (locale === "zh" ? "Tesla 账号" : "Tesla Account")}</p>
                      <p className="text-[11px] text-slate">{linked ? t.account.bound : t.account.unbound}</p>
                    </div>
                  </div>
                  <Button size="sm" variant={linked ? "outline" : "primary"} loading={linking === p} onClick={() => toggleLink(p)} icon={linked ? <Unlink className="size-3.5" /> : <Link2 className="size-3.5" />}>
                    {linked ? (locale === "zh" ? "解绑" : "Unlink") : (p === "xiaomi" ? t.account.bindXiaomi : t.account.bindTesla)}
                  </Button>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-[11px] leading-4 text-ash">{locale === "zh" ? "绑定通过 OAuth 2.0 授权完成，本站不保存您的品牌账号密码。" : "Linking uses OAuth 2.0; we never store your brand account password."}</p>
        </div>

        <nav className="rounded-3xl bg-white p-2 hairline">
          {[
            { href: "/connect/garage", label: t.connect.garage },
            { href: "/connect/keys", label: t.account.keys },
            { href: "/connect/trip-planner", label: t.connect.trip },
            { href: "/service", label: t.connect.service },
            { href: "/trade-in", label: t.connect.tradeIn },
          ].map((i) => (
            <Link key={i.href} href={i.href} className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium hover:bg-mist">
              {i.label}
              <ArrowRight className="size-4 text-ash" />
            </Link>
          ))}
        </nav>
      </aside>

      <div className="space-y-8">
        <section>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{t.account.orders}</h3>
            <Link href="/order" className="text-sm text-graphite underline-offset-4 hover:underline">{t.nav.order}</Link>
          </div>
          {orders.length === 0 ? (
            <div className="mt-4 rounded-3xl bg-cloud p-8 text-center text-sm text-slate hairline">
              {locale === "zh" ? "暂无订单。登录状态下下的订单会显示在这里。" : "No orders yet. Orders placed while signed in appear here."}
              <div className="mt-4"><Button href="/vehicles" size="sm">{t.nav.design}</Button></div>
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {orders.map((o) => {
                const v = vehicles.find((x) => x.slug === o.vehicleSlug);
                return (
                  <li key={o.id}>
                    <Link href={`/order/${o.id}`} className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-white p-5 hairline transition-shadow hover:shadow-soft">
                      <div>
                        <p className="font-semibold">{v ? pick(v.name) : o.vehicleSlug} <span className="ml-2 font-mono text-xs font-normal text-slate">{o.id}</span></p>
                        <p className="mt-1 text-xs text-slate">{formatDateTime(o.createdAt, locale)} · {formatCNY(o.quote.total)}</p>
                      </div>
                      <Badge tone="success">{statusLabel[o.status]}</Badge>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="rounded-3xl bg-cloud p-6 hairline">
          <h3 className="text-lg font-semibold">{locale === "zh" ? "隐私中心" : "Privacy centre"}</h3>
          <p className="mt-2 text-sm leading-6 text-slate">{locale === "zh" ? "您可以随时导出或删除账户数据。撤销品牌账号授权后，相关车辆数据将在 30 天内删除。" : "Export or delete your data at any time. After revoking a brand authorisation, related vehicle data is deleted within 30 days."}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button href="/legal/privacy" variant="outline" size="sm">{t.footer.privacy}</Button>
            <Button href="/support#contact" variant="outline" size="sm">{locale === "zh" ? "申请导出 / 删除" : "Request export / deletion"}</Button>
          </div>
        </section>
      </div>
    </div>
  );
}
