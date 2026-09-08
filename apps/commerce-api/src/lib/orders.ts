export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "COMPLETED"
  | "CANCELLED";

export type Currency = "IDR";

export type OrderItem = {
  id: string;
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type Order = {
  id: string;
  sourceQuotationId: string | null;
  customerId: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  currency: Currency;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
};

export type CreateOrderFromQuotationInput = {
  sourceQuotationId: string;
  customerId: string;
  customerName: string;

  items: Array<{
    sku: string;
    name: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;

  subtotal: number;
  discount: number;
  total: number;
  currency: Currency;
};

export class OrderDomainError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);

    this.name = "OrderDomainError";
    this.statusCode = statusCode;
  }
}

export function assertOrderTransition(
  orderId: string,
  currentStatus: OrderStatus,
  allowedStatuses: OrderStatus[],
  nextStatus: OrderStatus,
) {
  if (!allowedStatuses.includes(currentStatus)) {
    throw new OrderDomainError(
      `Order ${orderId} cannot transition from ${currentStatus} to ${nextStatus}.`,
      409,
    );
  }
}
