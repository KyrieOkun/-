import Link from "next/link";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "light" | "glass" | "danger";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-ink text-white hover:bg-black active:bg-black/90 shadow-soft",
  secondary: "bg-mist text-ink hover:bg-line active:bg-line",
  ghost: "bg-transparent text-ink hover:bg-ink/5",
  outline: "bg-transparent text-ink ring-1 ring-inset ring-ink/20 hover:ring-ink/60",
  light: "bg-white text-ink hover:bg-white/90 shadow-soft",
  glass: "bg-white/15 text-white ring-1 ring-inset ring-white/40 backdrop-blur-md hover:bg-white/25",
  danger: "bg-danger text-white hover:bg-red-700",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-[13px]",
  md: "h-10 px-6 text-sm",
  lg: "h-12 px-8 text-[15px]",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  href?: string;
  external?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", href, external, loading, icon, iconRight, fullWidth, children, disabled, ...props },
  ref,
) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-pill font-medium tracking-tight transition-all duration-200 focus-ring select-none whitespace-nowrap",
    variants[variant],
    sizes[size],
    fullWidth && "w-full",
    (disabled || loading) && "pointer-events-none opacity-60",
    className,
  );

  const content = (
    <>
      {loading ? <Spinner /> : icon}
      {children}
      {iconRight}
    </>
  );

  if (href) {
    if (external) {
      return (
        <a href={href} className={classes} target="_blank" rel="noopener noreferrer">
          {content}
        </a>
      );
    }
    return (
      <Link href={href} className={classes} prefetch={false}>
        {content}
      </Link>
    );
  }

  return (
    <button ref={ref} className={classes} disabled={disabled || loading} {...props}>
      {content}
    </button>
  );
});

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent", className)}
    />
  );
}
