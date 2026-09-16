import { useId } from "react";
import type { InteriorOption, PaintOption, WheelOption } from "@/data/types";
import { cn } from "@/lib/utils";

export function PaintSwatch({ paint, size = 40, selected, className }: { paint: PaintOption; size?: number; selected?: boolean; className?: string }) {
  const finishOverlay =
    paint.finish === "matte"
      ? "linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0) 60%)"
      : paint.finish === "pearl"
        ? "linear-gradient(135deg, rgba(255,255,255,0.75), rgba(255,255,255,0.1) 45%, rgba(255,255,255,0.35) 100%)"
        : "linear-gradient(135deg, rgba(255,255,255,0.6), rgba(255,255,255,0) 40%, rgba(0,0,0,0.15) 70%, rgba(255,255,255,0.25) 100%)";
  return (
    <span
      aria-hidden
      className={cn("relative inline-block shrink-0 rounded-full ring-1 ring-inset ring-black/10 transition-transform", selected && "scale-110", className)}
      style={{
        width: size,
        height: size,
        backgroundImage: `${finishOverlay}, radial-gradient(circle at 35% 30%, ${paint.hex} 0%, ${paint.hex2 ?? paint.hex} 100%)`,
        boxShadow: selected ? "0 0 0 2px #fff, 0 0 0 4px #171a20" : undefined,
      }}
    />
  );
}

export function PaintPanel({ paint, className }: { paint: PaintOption; className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("relative overflow-hidden rounded-3xl", className)}
      style={{ backgroundImage: `radial-gradient(120% 90% at 20% 10%, ${paint.hex} 0%, ${paint.hex2 ?? paint.hex} 75%)` }}
    >
      <div className="metallic absolute inset-0" />
      <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/30 to-transparent" />
    </div>
  );
}

export function InteriorSwatch({ interior, size = 40, selected, className }: { interior: InteriorOption; size?: number; selected?: boolean; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("relative inline-block shrink-0 overflow-hidden rounded-full ring-1 ring-inset ring-black/10", selected && "scale-110", className)}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${interior.primary} 0 55%, ${interior.secondary} 55% 100%)`,
        boxShadow: selected ? "0 0 0 2px #fff, 0 0 0 4px #171a20" : undefined,
      }}
    />
  );
}

export function WheelGlyph({ wheel, size = 56, selected, className }: { wheel: WheelOption; size?: number; selected?: boolean; className?: string }) {
  const spokes = wheel.style === "aero" ? 5 : wheel.style === "sport" ? 10 : wheel.style === "forged" ? 7 : 6;
  const spokeWidth = wheel.style === "aero" ? 14 : wheel.style === "forged" ? 6 : 8;
  const rimStroke = wheel.style === "aero" ? "#c9ccd1" : "#a3a7ad";
  const uid = useId();
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden className={cn("shrink-0 transition-transform", selected && "scale-105", className)}>
      <defs>
        <radialGradient id={`tyre-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="70%" stopColor="#2a2b2f" />
          <stop offset="100%" stopColor="#0f1012" />
        </radialGradient>
        <linearGradient id={`rim-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f4f5f7" />
          <stop offset="55%" stopColor={rimStroke} />
          <stop offset="100%" stopColor="#5f6368" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill={`url(#tyre-${uid})`} />
      <circle cx="50" cy="50" r={wheel.size >= 21 ? 40 : wheel.size >= 20 ? 37 : 34} fill={`url(#rim-${uid})`} />
      <circle cx="50" cy="50" r={wheel.size >= 21 ? 34 : wheel.size >= 20 ? 31 : 28} fill="#1b1c20" />
      {Array.from({ length: spokes }).map((_, i) => (
        <rect
          key={i}
          x={50 - spokeWidth / 2}
          y="16"
          width={spokeWidth}
          height="34"
          rx={spokeWidth / 2}
          fill={`url(#rim-${uid})`}
          transform={`rotate(${(360 / spokes) * i} 50 50)`}
        />
      ))}
      <circle cx="50" cy="50" r="7" fill="#e6e7ea" stroke="#8e8e93" strokeWidth="1" />
      {selected ? <circle cx="50" cy="50" r="48" fill="none" stroke="#171a20" strokeWidth="3" /> : null}
    </svg>
  );
}
