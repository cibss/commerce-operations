import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children?: ReactNode;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  children,
}: PageHeaderProps) {
  return (
    <header>
      <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-start">
        <div className="max-w-3xl">
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">
              {eyebrow}
            </p>
          ) : null}

          <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-slate-950">
            {title}
          </h1>

          {description ? (
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              {description}
            </p>
          ) : null}
        </div>

        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>

      {children ? <div className="mt-6">{children}</div> : null}
    </header>
  );
}
