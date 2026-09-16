import { forwardRef, type HTMLAttributes, type InputHTMLAttributes, type LabelHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Container({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("container-x", className)} {...props} />;
}

export function Eyebrow({ className, children, tone = "dark" }: { className?: string; children: ReactNode; tone?: "dark" | "light" | "mi" | "tesla" }) {
  const tones = {
    dark: "text-slate",
    light: "text-white/70",
    mi: "text-mi-deep",
    tesla: "text-tesla-deep",
  } as const;
  return (
    <p className={cn("text-[11px] font-semibold uppercase tracking-[0.22em]", tones[tone], className)}>{children}</p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
  tone = "dark",
  className,
  action,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "left" | "center";
  tone?: "dark" | "light";
  className?: string;
  action?: ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", align === "center" && "items-center text-center sm:flex-col sm:items-center", className)}>
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow ? <Eyebrow tone={tone === "light" ? "light" : "dark"} className="mb-3">{eyebrow}</Eyebrow> : null}
        <h2 className={cn("text-balance text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[44px] lg:leading-[1.08]", tone === "light" ? "text-white" : "text-ink")}>{title}</h2>
        {subtitle ? <p className={cn("mt-4 text-pretty text-base leading-7 sm:text-lg", tone === "light" ? "text-white/70" : "text-slate")}>{subtitle}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function Badge({ className, children, tone = "neutral" }: { className?: string; children: ReactNode; tone?: "neutral" | "mi" | "tesla" | "success" | "dark" | "light" | "gold" }) {
  const tones = {
    neutral: "bg-mist text-graphite",
    mi: "bg-mi/10 text-mi-deep",
    tesla: "bg-tesla/10 text-tesla-deep",
    success: "bg-success/10 text-success-deep",
    dark: "bg-ink text-white",
    light: "bg-white/15 text-white ring-1 ring-inset ring-white/30 backdrop-blur",
    gold: "bg-atelier/15 text-atelier-deep",
  } as const;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-pill px-2.5 py-1 text-[11px] font-semibold tracking-wide", tones[tone], className)}>{children}</span>
  );
}

export function BrandDot({ brand, className }: { brand: "xiaomi" | "tesla"; className?: string }) {
  return <span aria-hidden className={cn("inline-block size-2 rounded-full", brand === "xiaomi" ? "bg-mi" : "bg-tesla", className)} />;
}

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-3xl bg-white hairline", className)} {...props} />;
}

export function Divider({ className }: { className?: string }) {
  return <hr className={cn("border-0 border-t border-line", className)} />;
}

// Keep the label component locale-agnostic: both readings are given for screen readers.
const REQUIRED_LABEL = "必填 / required";

export const Label = forwardRef<HTMLLabelElement, LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean; hint?: ReactNode }>(function Label(
  { className, children, required, hint, ...props },
  ref,
) {
  return (
    <label ref={ref} className={cn("mb-1.5 flex items-baseline justify-between text-[13px] font-medium text-graphite", className)} {...props}>
      <span>
        {children}
        {required ? (
          <>
            <span aria-hidden className="ml-0.5 text-tesla">*</span>
            <span className="sr-only"> ({REQUIRED_LABEL})</span>
          </>
        ) : null}
      </span>
      {hint ? <span className="text-xs font-normal text-ash">{hint}</span> : null}
    </label>
  );
});

const fieldBase =
  "w-full rounded-xl border border-line bg-white px-4 text-[15px] text-ink placeholder:text-ash transition-colors focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/10 disabled:bg-mist disabled:text-ash aria-[invalid=true]:border-danger";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...props }, ref) {
  return <input ref={ref} className={cn(fieldBase, "h-12", className)} {...props} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea({ className, ...props }, ref) {
  return <textarea ref={ref} className={cn(fieldBase, "min-h-28 py-3", className)} {...props} />;
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select({ className, children, ...props }, ref) {
  return (
    <select ref={ref} className={cn(fieldBase, "h-12 pr-10", className)} {...props}>
      {children}
    </select>
  );
});

export function FieldError({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return (
    <p role="alert" className="mt-1.5 text-xs text-danger">
      {children}
    </p>
  );
}

export function Stat({ value, unit, label, tone = "dark", size = "md" }: { value: string; unit?: string; label: ReactNode; tone?: "dark" | "light"; size?: "sm" | "md" | "lg" }) {
  const valueSize = { sm: "text-2xl", md: "text-3xl sm:text-4xl", lg: "text-4xl sm:text-5xl" }[size];
  return (
    <div className="flex flex-col">
      <div className={cn("flex items-baseline gap-1 font-semibold tracking-tight tabular-nums", valueSize, tone === "light" ? "text-white" : "text-ink")}>
        <span>{value}</span>
        {unit ? <span className={cn("text-sm font-medium sm:text-base", tone === "light" ? "text-white/70" : "text-slate")}>{unit}</span> : null}
      </div>
      <div className={cn("mt-1 text-xs sm:text-[13px]", tone === "light" ? "text-white/60" : "text-slate")}>{label}</div>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-mist", className)} />;
}

export function Toast({ tone = "success", children }: { tone?: "success" | "error" | "info"; children: ReactNode }) {
  const tones = {
    success: "bg-ink text-white",
    error: "bg-danger text-white",
    info: "bg-white text-ink hairline",
  } as const;
  return (
    <div role="status" className={cn("pointer-events-auto rounded-2xl px-4 py-3 text-sm shadow-lift", tones[tone])}>
      {children}
    </div>
  );
}
