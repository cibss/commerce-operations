import type { ReactNode } from "react";

type PanelProps = {
  children: ReactNode;
  className?: string;
};

type PanelHeaderProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function Panel({ children, className = "" }: PanelProps) {
  return (
    <section
      className={[
        "overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03),0_8px_30px_rgba(15,23,42,0.04)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </section>
  );
}

export function PanelHeader({ title, description, action }: PanelHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-5 border-b border-slate-100 px-6 py-5">
      <div>
        <h2 className="text-sm font-semibold text-slate-950">{title}</h2>

        {description ? (
          <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
        ) : null}
      </div>

      {action}
    </div>
  );
}
