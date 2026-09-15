import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/server";
import { vehicles } from "@/data/vehicles";
import { Container, Eyebrow } from "@/components/ui/primitives";
import { AuthGate } from "@/components/auth/auth-gate";
import { Garage } from "@/components/connect/garage";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.connect.garage, description: t.connect.subtitle, robots: { index: false } };
}

export default async function GaragePage() {
  const { t, locale } = await getI18n();
  return (
    <div className="pt-14">
      <section className="border-b border-line bg-cloud">
        <Container className="py-12 lg:py-16">
          <Eyebrow className="mb-3">{t.connect.title}</Eyebrow>
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">{t.connect.garage}</h1>
          <p className="mt-4 max-w-2xl text-pretty text-base leading-7 text-slate sm:text-lg">
            {locale === "zh" ? "SU7 与 Model Y 在同一个页面：电量、续航、位置、锁车状态与远程控制。" : "Your SU7 and Model Y on one screen: charge, range, location, lock state and remote controls."}
          </p>
        </Container>
      </section>
      <Container className="py-12 pb-24">
        <AuthGate title={t.connect.requireLogin} description={t.account.oneIdBody}>
          <Garage vehicles={vehicles} />
        </AuthGate>
      </Container>
    </div>
  );
}
