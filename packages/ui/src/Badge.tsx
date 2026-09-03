import type { HTMLAttributes, ReactNode } from "react";

export type BadgeVariant =
  | "neutral"
  | "info"
  | "warning"
  | "success"
  | "danger"
  | "accent";

type BadgeProps = {
  children: ReactNode;
  variant?: BadgeVariant;
} & HTMLAttributes<HTMLSpanElement>;

const variantClasses: Record<BadgeVariant, string> = {
  neutral: "border-slate-200 bg-slate-50 text-slate-600",
  info: "border-blue-200 bg-blue-50 text-blue-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  danger: "border-rose-200 bg-rose-50 text-rose-700",
  accent: "border-indigo-200 bg-indigo-50 text-indigo-700",
};

export function Badge({
  children,
  variant = "neutral",
  className = "",
  ...props
}: BadgeProps) {
  return (
    <span
      {...props}
      className={[
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide",
        variantClasses[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </span>
  );
}
