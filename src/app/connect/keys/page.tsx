import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/server";
import { getCurrentUser, toPublicUser } from "@/lib/auth";
import { vehicles } from "@/data/vehicles";
import { Container, Eyebrow } from "@/components/ui/primitives";
import { AuthGate } from "@/components/auth/auth-gate";
import { Keys } from "@/components/connect/keys";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.connect.keysTitle, description: t.connect.keysSubtitle, robots: { index: false } };
}

export default async function KeysPage() {
  const [{ t }, user] = await Promise.all([getI18n(), getCurrentUser()]);
  return (
    <div className="pt-14">
      <section className="border-b border-line bg-cloud">
        <Container className="py-12 lg:py-16">
          <Eyebrow className="mb-3">{t.connect.title}</Eyebrow>
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">{t.connect.keysTitle}</h1>
          <p className="mt-4 max-w-2xl text-pretty text-base leading-7 text-slate sm:text-lg">{t.connect.keysSubtitle}</p>
        </Container>
      </section>
      <Container className="py-12 pb-24">
        <AuthGate title={t.connect.requireLogin} description={t.connect.keysSubtitle} initialUser={user ? toPublicUser(user) : null}>
          <Keys vehicles={vehicles} />
        </AuthGate>
      </Container>
    </div>
  );
}
