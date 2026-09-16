"use client";

import { useState } from "react";
import Image from "next/image";
import type { InteriorOption, PaintOption, WheelOption } from "@/data/types";
import { useI18n } from "@/lib/i18n/provider";
import { cn, formatCNY } from "@/lib/utils";
import { InteriorSwatch, PaintPanel, PaintSwatch, WheelGlyph } from "./swatches";

export function PaintExplorer({ paints, wheels, interiors, initialPaintId }: { paints: PaintOption[]; wheels: WheelOption[]; interiors: InteriorOption[]; initialPaintId?: string }) {
  const { t, pick } = useI18n();
  const [paint, setPaint] = useState(paints.find((p) => p.id === initialPaintId) ?? paints[0]);
  const [wheel, setWheel] = useState(wheels[0]);
  const [interior, setInterior] = useState(interiors[0]);

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
      <div className="relative">
        {paint.image ? (
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-3xl bg-mist shadow-lift">
            <Image key={paint.image} src={paint.image} alt={pick(paint.name)} fill sizes="(min-width: 1024px) 55vw, 100vw" className="animate-fade-in object-cover" />
          </div>
        ) : (
          <PaintPanel paint={paint} className="aspect-[16/10] w-full shadow-lift" />
        )}
        <div className="absolute bottom-5 left-5 flex items-center gap-3 rounded-2xl bg-white/85 px-4 py-3 backdrop-blur">
          {wheel.image ? (
            <span className="relative size-11 overflow-hidden rounded-full bg-mist">
              <Image src={wheel.image} alt="" fill sizes="44px" className="object-cover" />
            </span>
          ) : (
            <WheelGlyph wheel={wheel} size={44} />
          )}
          {interior.image ? (
            <span className="relative size-7 overflow-hidden rounded-full bg-mist">
              <Image src={interior.image} alt="" fill sizes="28px" className="object-cover" />
            </span>
          ) : (
            <InteriorSwatch interior={interior} size={28} />
          )}
          <div>
            <p className="text-sm font-semibold">{pick(paint.name)}</p>
            <p className="text-xs text-slate">
              {t.configurator.paintFinish[paint.finish]} · {paint.price === 0 ? t.common.included : `+${formatCNY(paint.price)}`}
            </p>
          </div>
        </div>
      </div>
      <div className="space-y-8">
        <div>
          <h3 className="text-sm font-semibold text-slate">{t.vehicles.colors}</h3>
          <div className="mt-4 flex flex-wrap gap-3">
            {paints.map((p) => (
              <button key={p.id} type="button" onClick={() => setPaint(p)} className="focus-ring rounded-full" aria-label={pick(p.name)} aria-pressed={paint.id === p.id}>
                <PaintSwatch paint={p} size={40} selected={paint.id === p.id} />
              </button>
            ))}
          </div>
          <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm text-graphite sm:grid-cols-3">
            {paints.map((p) => (
              <li key={p.id} className="flex items-center gap-2">
                <PaintSwatch paint={p} size={12} />
                <span className="truncate">{pick(p.name)}</span>
                {p.isNew ? <span className="rounded-pill bg-ink px-1.5 text-[10px] font-semibold text-white">{t.common.new}</span> : null}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate">{t.vehicles.wheels}</h3>
          <div className="mt-4 flex flex-wrap gap-3">
            {wheels.map((w) => (
              <button key={w.id} type="button" onClick={() => setWheel(w)} className="focus-ring rounded-full" aria-label={pick(w.name)} aria-pressed={wheel.id === w.id}>
                {w.image ? (
                  <span className={cn("relative block size-[52px] overflow-hidden rounded-full bg-mist ring-1 ring-inset ring-black/10 transition-transform", wheel.id === w.id && "scale-105 ring-2 ring-ink")}>
                    <Image src={w.image} alt="" fill sizes="52px" className="object-cover" />
                  </span>
                ) : (
                  <WheelGlyph wheel={w} size={52} selected={wheel.id === w.id} />
                )}
              </button>
            ))}
          </div>
          <p className="mt-3 text-sm text-graphite">
            {pick(wheel.name)} · {wheel.price === 0 ? t.common.included : `+${formatCNY(wheel.price)}`}
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate">{t.vehicles.interiors}</h3>
          <div className="mt-4 flex flex-wrap gap-3">
            {interiors.map((i) => (
              <button key={i.id} type="button" onClick={() => setInterior(i)} className="focus-ring rounded-full" aria-label={pick(i.name)} aria-pressed={interior.id === i.id}>
                {i.image ? (
                  <span className={cn("relative block size-10 overflow-hidden rounded-full bg-mist ring-1 ring-inset ring-black/10 transition-transform", interior.id === i.id && "scale-110 ring-2 ring-ink")}>
                    <Image src={i.image} alt="" fill sizes="40px" className="object-cover" />
                  </span>
                ) : (
                  <InteriorSwatch interior={i} size={40} selected={interior.id === i.id} />
                )}
              </button>
            ))}
          </div>
          <p className="mt-3 text-sm text-graphite">
            {pick(interior.name)} · {pick(interior.material)} · {interior.price === 0 ? t.common.included : `+${formatCNY(interior.price)}`}
          </p>
        </div>
      </div>
    </div>
  );
}
