import Link from "next/link";
import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode } from "react";
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
    // Forward the generic props (onClick, aria-*, data-*, id, title) onto the anchor;
    // button-only attributes (type, form*, value) are not meaningful on links.
    const { type: _type, value: _value, form: _form, formAction: _fa, formMethod: _fm, formTarget: _ft, formEncType: _fe, formNoValidate: _fn, ...anchorProps } = props;
    void _type; void _value; void _form; void _fa; void _fm; void _ft; void _fe; void _fn;
    const inert = disabled || loading;
    const shared = { ...(anchorProps as AnchorHTMLAttributes<HTMLAnchorElement>), className: classes, "aria-disabled": inert || undefined, "aria-busy": loading || undefined, tabIndex: inert ? -1 : anchorProps.tabIndex };
    if (external) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" {...shared}>
          {content}
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      );
    }
    return (
      <Link href={href} prefetch={false} {...shared}>
        {content}
      </Link>
    );
  }

  return (
    <button ref={ref} className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
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
