"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import type { Faq } from "@/data/site";
import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

const GROUPS: Faq["group"][] = ["order", "charging", "connect", "service", "atelier"];

export function FaqList({ faqs }: { faqs: Faq[] }) {
  const { pick, locale, t } = useI18n();
  const [group, setGroup] = useState<"all" | Faq["group"]>("all");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(faqs[0]?.id ?? null);

  const groupLabel: Record<Faq["group"], string> = locale === "zh"
    ? { order: "订购与交付", charging: "充电", connect: "联动与账户", service: "服务与置换", atelier: "定制工坊" }
    : { order: "Ordering & delivery", charging: "Charging", connect: "Connect & account", service: "Service & trade-in", atelier: "Atelier" };

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return faqs.filter((f) => (group === "all" ? true : f.group === group)).filter((f) => (q ? `${f.q.zh} ${f.q.en} ${f.a.zh} ${f.a.en}`.toLowerCase().includes(q) : true));
  }, [faqs, group, query]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => setGroup("all")} className={cn("h-9 rounded-pill px-4 text-sm font-medium transition-colors", group === "all" ? "bg-ink text-white" : "bg-mist text-graphite hover:bg-line")}>{t.common.all}</button>
        {GROUPS.map((g) => (
          <button key={g} onClick={() => setGroup(g)} className={cn("h-9 rounded-pill px-4 text-sm font-medium transition-colors", group === g ? "bg-ink text-white" : "bg-mist text-graphite hover:bg-line")}>{groupLabel[g]}</button>
        ))}
        <label className="relative ml-auto min-w-[220px] flex-1 sm:flex-none">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ash" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.common.search} className="h-9 w-full rounded-pill border border-line bg-white pl-9 pr-4 text-sm focus:border-ink focus:outline-none" />
        </label>
      </div>
      <ul className="mt-6 divide-y divide-line rounded-3xl bg-white px-6 hairline">
        {list.map((f) => {
          const expanded = open === f.id;
          return (
            <li key={f.id}>
              <button type="button" onClick={() => setOpen(expanded ? null : f.id)} aria-expanded={expanded} className="flex w-full items-center justify-between gap-4 py-5 text-left focus-ring rounded">
                <span className="font-medium">{pick(f.q)}</span>
                <ChevronDown className={cn("size-5 shrink-0 text-ash transition-transform", expanded && "rotate-180")} />
              </button>
              <div className={cn("grid transition-all duration-300", expanded ? "grid-rows-[1fr] pb-5 opacity-100" : "grid-rows-[0fr] opacity-0")}>
                <p className="overflow-hidden text-sm leading-7 text-graphite">{pick(f.a)}</p>
              </div>
            </li>
          );
        })}
        {list.length === 0 ? <li className="py-10 text-center text-sm text-slate">{t.vehicles.noResults}</li> : null}
      </ul>
    </div>
  );
}
