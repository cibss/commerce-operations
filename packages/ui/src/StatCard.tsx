import type { ReactNode } from "react";

type StatCardTone = "neutral" | "indigo" | "emerald" | "amber";

type StatCardProps = {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: StatCardTone;
};

const tones: Record<StatCardTone, string> = {
  neutral: "bg-slate-100 text-slate-600",
  indigo: "bg-indigo-50 text-indigo-600",
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
};

export function StatCard({
  label,
  value,
  hint,
  tone = "neutral",
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03),0_6px_24px_rgba(15,23,42,0.035)]">
      <div
        className={`inline-flex rounded-lg px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${tones[tone]}`}
      >
        {label}
      </div>

      <div className="mt-4 text-2xl font-bold tracking-tight text-slate-950">
        {value}
      </div>

      {hint ? <p className="mt-1 text-sm text-slate-500">{hint}</p> : null}
    </div>
  );
}
