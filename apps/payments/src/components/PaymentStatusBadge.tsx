import { Badge, type BadgeVariant } from "@commerce/ui";

import type { PaymentStatus } from "@/lib/payment";

type PaymentStatusBadgeProps = {
  status: PaymentStatus;
};

const statusVariants: Record<PaymentStatus, BadgeVariant> = {
  PENDING: "warning",
  PAID: "success",
  FAILED: "danger",
  REFUNDED: "accent",
};

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  return <Badge variant={statusVariants[status]}>{status}</Badge>;
}
