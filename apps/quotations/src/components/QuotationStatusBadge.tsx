import { Badge, type BadgeVariant } from "@commerce/ui";

import type { QuotationStatus } from "@/lib/quotation";

type QuotationStatusBadgeProps = {
  status: QuotationStatus;
};

const statusVariants: Record<QuotationStatus, BadgeVariant> = {
  DRAFT: "neutral",
  SENT: "info",
  ACCEPTED: "success",
  REJECTED: "danger",
  CONVERTED: "accent",
};

export function QuotationStatusBadge({ status }: QuotationStatusBadgeProps) {
  return <Badge variant={statusVariants[status]}>{status}</Badge>;
}
