"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/primitives";
import { useI18n } from "@/lib/i18n/provider";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useI18n();
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="pt-14">
      <Container className="flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
        <p className="eyebrow text-slate">500</p>
        <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">{t.errors.genericTitle}</h1>
        <p className="mt-4 max-w-md text-pretty text-graphite">{t.errors.genericBody}</p>
        {error.digest ? <p className="mt-2 font-mono text-xs text-ash">{error.digest}</p> : null}
        <div className="mt-8 flex gap-3">
          <Button onClick={reset}>{t.common.retry}</Button>
          <Button href="/" variant="secondary">{t.errors.backHome}</Button>
        </div>
      </Container>
    </div>
  );
}
