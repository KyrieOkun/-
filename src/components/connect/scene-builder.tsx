"use client";

import { useEffect, useState } from "react";
import { Check, Plus, Trash2, Zap } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/primitives";

interface Scene {
  id: string;
  name: string;
  trigger: string;
  actions: string[];
  enabled: boolean;
  brand: "xiaomi" | "tesla" | "both";
}

const STORAGE_KEY = "mta:scenes";

export function SceneBuilder() {
  const { locale } = useI18n();
  const zh = locale === "zh";

  const triggers = [
    { id: "arrive-home", label: zh ? "车辆到达家附近 500 m" : "Vehicle within 500 m of home", brand: "both" as const },
    { id: "leave-home", label: zh ? "车辆离开家" : "Vehicle leaves home", brand: "both" as const },
    { id: "charge-complete", label: zh ? "Tesla 充电完成" : "Tesla charging complete", brand: "tesla" as const },
    { id: "sentry-alert", label: zh ? "Tesla 哨兵模式告警" : "Tesla Sentry alert", brand: "tesla" as const },
    { id: "low-battery", label: zh ? "小米汽车电量低于 20%" : "Xiaomi EV battery below 20%", brand: "xiaomi" as const },
    { id: "morning", label: zh ? "工作日 07:30" : "Weekdays 07:30", brand: "both" as const },
  ];
  const actions = [
    { id: "lights-on", label: zh ? "打开米家客厅灯" : "Turn on Mi Home living-room lights", brand: "xiaomi" as const },
    { id: "ac-on", label: zh ? "打开米家空调 24℃" : "Set Mi Home AC to 24 °C", brand: "xiaomi" as const },
    { id: "gate-open", label: zh ? "打开车库门" : "Open garage door", brand: "xiaomi" as const },
    { id: "preheat", label: zh ? "车辆预热 / 预冷至 22℃" : "Precondition cabin to 22 °C", brand: "both" as const },
    { id: "notify-phone", label: zh ? "推送到小米手机与音箱" : "Notify Xiaomi phone & speaker", brand: "xiaomi" as const },
    { id: "start-charge", label: zh ? "开始充电（谷电时段）" : "Start charging (off-peak)", brand: "both" as const },
    { id: "robot-vacuum", label: zh ? "启动扫地机器人" : "Start robot vacuum", brand: "xiaomi" as const },
    { id: "sentry-on", label: zh ? "开启 Tesla 哨兵模式" : "Enable Tesla Sentry Mode", brand: "tesla" as const },
  ];

  const presets: Scene[] = [
    { id: "p1", name: zh ? "回家模式" : "Arrive home", trigger: "arrive-home", actions: ["lights-on", "ac-on", "gate-open"], enabled: true, brand: "both" },
    { id: "p2", name: zh ? "出发预热" : "Morning warm-up", trigger: "morning", actions: ["preheat"], enabled: true, brand: "both" },
    { id: "p3", name: zh ? "充电完成提醒" : "Charge complete", trigger: "charge-complete", actions: ["notify-phone"], enabled: true, brand: "tesla" },
    { id: "p4", name: zh ? "离家安防" : "Leave home security", trigger: "leave-home", actions: ["sentry-on", "robot-vacuum"], enabled: false, brand: "both" },
  ];

  const [scenes, setScenes] = useState<Scene[]>(presets);
  const [building, setBuilding] = useState(false);
  const [name, setName] = useState("");
  const [trigger, setTrigger] = useState(triggers[0].id);
  const [picked, setPicked] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setScenes(JSON.parse(raw) as Scene[]);
    } catch {
      /* ignore */
    }
  }, []);

  const persist = (next: Scene[]) => {
    setScenes(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const labelOf = (list: { id: string; label: string }[], id: string) => list.find((x) => x.id === id)?.label ?? id;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold">{zh ? "我的场景" : "My scenes"}</h3>
        <Button size="sm" onClick={() => setBuilding(true)} icon={<Plus className="size-4" />}>{zh ? "新建场景" : "New scene"}</Button>
      </div>

      {building ? (
        <div className="mb-6 rounded-3xl bg-cloud p-6 hairline">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-graphite" htmlFor="scene-name">{zh ? "场景名称" : "Scene name"}</label>
              <input id="scene-name" value={name} onChange={(e) => setName(e.target.value)} className="h-12 w-full rounded-xl border border-line bg-white px-4 text-[15px] focus:border-ink focus:outline-none" placeholder={zh ? "例如：周末露营" : "e.g. Weekend camping"} />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-graphite" htmlFor="scene-trigger">{zh ? "触发条件（如果）" : "Trigger (if)"}</label>
              <select id="scene-trigger" value={trigger} onChange={(e) => setTrigger(e.target.value)} className="h-12 w-full rounded-xl border border-line bg-white pl-4 pr-10 text-[15px] focus:border-ink focus:outline-none">
                {triggers.map((tr) => (
                  <option key={tr.id} value={tr.id}>{tr.label}</option>
                ))}
              </select>
            </div>
          </div>
          <p className="mt-5 mb-2 text-[13px] font-medium text-graphite">{zh ? "执行动作（那么）" : "Actions (then)"}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {actions.map((a) => {
              const on = picked.includes(a.id);
              return (
                <button key={a.id} type="button" onClick={() => setPicked(on ? picked.filter((x) => x !== a.id) : [...picked, a.id])} aria-pressed={on} className={cn("flex items-center gap-3 rounded-2xl border bg-white p-3 text-left text-sm transition-colors focus-ring", on ? "border-ink" : "border-line hover:border-ash")}>
                  <span className={cn("flex size-5 items-center justify-center rounded-md border", on ? "border-ink bg-ink text-white" : "border-ash")}>{on ? <Check className="size-3.5" /> : null}</span>
                  <span className="flex-1">{a.label}</span>
                  <span className={cn("size-1.5 rounded-full", a.brand === "xiaomi" ? "bg-mi" : a.brand === "tesla" ? "bg-tesla" : "bg-ink")} />
                </button>
              );
            })}
          </div>
          <div className="mt-5 flex gap-3">
            <Button
              disabled={!name.trim() || picked.length === 0}
              onClick={() => {
                persist([{ id: `s-${Date.now()}`, name: name.trim(), trigger, actions: picked, enabled: true, brand: "both" }, ...scenes]);
                setBuilding(false);
                setName("");
                setPicked([]);
              }}
            >
              {zh ? "保存并启用" : "Save & enable"}
            </Button>
            <Button variant="secondary" onClick={() => setBuilding(false)}>{zh ? "取消" : "Cancel"}</Button>
          </div>
        </div>
      ) : null}

      <ul className="grid gap-4 md:grid-cols-2">
        {scenes.map((s) => (
          <li key={s.id} className={cn("rounded-3xl bg-white p-5 hairline transition-opacity", !s.enabled && "opacity-60")}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{s.name}</p>
                <p className="mt-1 text-xs text-slate"><span className="font-medium text-graphite">{zh ? "如果" : "If"}</span> {labelOf(triggers, s.trigger)}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={s.enabled}
                aria-label={`${zh ? "启用场景" : "Enable scene"} ${s.name}`}
                onClick={() => persist(scenes.map((x) => (x.id === s.id ? { ...x, enabled: !x.enabled } : x)))}
                className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors focus-ring", s.enabled ? "bg-success" : "bg-line")}
              >
                <span className={cn("absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform", s.enabled ? "translate-x-5" : "translate-x-0.5")} />
              </button>
            </div>
            <ul className="mt-3 space-y-1.5">
              {s.actions.map((a) => (
                <li key={a} className="flex items-center gap-2 text-sm text-graphite">
                  <Zap className="size-3.5 text-ash" />
                  {labelOf(actions, a)}
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center justify-between">
              <Badge tone={s.enabled ? "success" : "neutral"}>{s.enabled ? (zh ? "已启用" : "Enabled") : (zh ? "已停用" : "Disabled")}</Badge>
              <button type="button" onClick={() => persist(scenes.filter((x) => x.id !== s.id))} className="inline-flex items-center gap-1 text-xs text-ash hover:text-danger focus-ring rounded">
                <Trash2 className="size-3.5" />{zh ? "删除" : "Delete"}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
