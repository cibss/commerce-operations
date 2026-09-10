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

export type OrderPaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "REFUNDED"
  | "CANCELLED";

export type OrderPaymentMethod = "BANK_TRANSFER" | "VIRTUAL_ACCOUNT" | "CARD";

export type OrderPayment = {
  id: string;
  orderId: string;
  amount: number;
  currency: Currency;
  method: OrderPaymentMethod;
  status: OrderPaymentStatus;
  reference: string;
  createdAt: string;
  updatedAt: string;
  paidAt: string | null;
  refundedAt: string | null;
};

export function formatCurrency(amount: number, currency: Currency) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
