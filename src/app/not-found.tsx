import { getI18n } from "@/lib/i18n/server";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/primitives";

export default async function NotFound() {
  const { t } = await getI18n();
  return (
    <div className="pt-14">
      <Container className="flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-ash">404</p>
        <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">{t.errors.notFoundTitle}</h1>
        <p className="mt-4 max-w-md text-pretty text-slate">{t.errors.notFoundBody}</p>
        <div className="mt-8 flex gap-3">
          <Button href="/">{t.errors.backHome}</Button>
          <Button href="/vehicles" variant="secondary">{t.nav.allVehicles}</Button>
        </div>
      </Container>
    </div>
  );
}
