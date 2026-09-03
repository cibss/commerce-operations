import { Badge, type BadgeVariant } from "@commerce/ui";

import type { OrderStatus } from "@/lib/order";

type OrderStatusBadgeProps = {
  status: OrderStatus;
};

const statusVariants: Record<OrderStatus, BadgeVariant> = {
  PENDING: "warning",
  CONFIRMED: "info",
  PROCESSING: "accent",
  SHIPPED: "accent",
  COMPLETED: "success",
  CANCELLED: "danger",
};

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return <Badge variant={statusVariants[status]}>{status}</Badge>;
}
