import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/server";
import { getCurrentUser, toPublicUser } from "@/lib/auth";
import { vehicles } from "@/data/vehicles";
import { toClientVehicle } from "@/data/types";
import { Container, Eyebrow } from "@/components/ui/primitives";
import { AuthGate } from "@/components/auth/auth-gate";
import { AccountDashboard } from "@/components/account/account-dashboard";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.account.title, robots: { index: false } };
}

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const [{ t }, user, { mode }] = await Promise.all([getI18n(), getCurrentUser(), searchParams]);
  return (
    <div className="pt-14">
      <section className="border-b border-line bg-cloud">
        <Container className="py-12 lg:py-16">
          <Eyebrow className="mb-3">{t.account.oneIdTitle}</Eyebrow>
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">{t.account.title}</h1>
          <p className="mt-4 max-w-2xl text-pretty text-base leading-7 text-slate sm:text-lg">{t.account.oneIdBody}</p>
        </Container>
      </section>
      <Container className="py-12 pb-24">
        <AuthGate title={mode === "register" ? t.account.registerTitle : t.account.loginTitle} description={t.account.oneIdBody} initialUser={user ? toPublicUser(user) : null} initialMode={mode === "register" ? "register" : "login"}>
          <AccountDashboard vehicles={vehicles.map(toClientVehicle)} />
        </AuthGate>
      </Container>
    </div>
  );
}
