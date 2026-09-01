import type { PaymentStatus } from "@/lib/payment";

type PaymentStatusBadgeProps = {
  status: PaymentStatus;
};

const styles: Record<PaymentStatus, string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-700",
  PAID: "border-emerald-200 bg-emerald-50 text-emerald-700",
  FAILED: "border-red-200 bg-red-50 text-red-700",
  REFUNDED: "border-violet-200 bg-violet-50 text-violet-700",
};

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}
