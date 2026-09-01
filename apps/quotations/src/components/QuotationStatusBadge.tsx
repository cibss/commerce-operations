import type { QuotationStatus } from "@/lib/quotation";

type QuotationStatusBadgeProps = {
  status: QuotationStatus;
};

const statusStyles: Record<QuotationStatus, string> = {
  DRAFT: "border-slate-200 bg-slate-100 text-slate-700",
  SENT: "border-blue-200 bg-blue-50 text-blue-700",
  ACCEPTED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  REJECTED: "border-red-200 bg-red-50 text-red-700",
  CONVERTED: "border-violet-200 bg-violet-50 text-violet-700",
};

export function QuotationStatusBadge({ status }: QuotationStatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}
