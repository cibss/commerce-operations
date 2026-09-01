export type QuotationStatus =
  | "DRAFT"
  | "SENT"
  | "ACCEPTED"
  | "REJECTED"
  | "CONVERTED";

export type Currency = "IDR";

export type QuotationItem = {
  id: string;
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type Quotation = {
  id: string;
  customerId: string;
  customerName: string;
  items: QuotationItem[];
  subtotal: number;
  discount: number;
  total: number;
  currency: Currency;
  status: QuotationStatus;
  convertedOrderId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CustomerOption = {
  id: string;
  companyName: string;
};

export type CreateQuotationInput = {
  customerId: string;
  items: Array<{
    sku: string;
    name: string;
    quantity: number;
    unitPrice: number;
  }>;
  discount: number;
  currency: Currency;
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
