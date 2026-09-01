export type CustomerSegment = "ENTERPRISE" | "MID_MARKET" | "SMB";

export type CustomerStatus = "ACTIVE" | "INACTIVE";

export type Currency = "IDR";

export type Customer = {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  segment: CustomerSegment;
  status: CustomerStatus;
  createdAt: string;
  updatedAt: string;
};

export type CustomerOverview = {
  customer: Customer;
  stats: {
    quotationCount: number;
    orderCount: number;
    totalOrderValue: number;
  };
  quotations: Array<{
    id: string;
    total: number;
    currency: Currency;
    status: string;
    updatedAt: string;
  }>;
  orders: Array<{
    id: string;
    sourceQuotationId: string | null;
    total: number;
    currency: Currency;
    status: string;
    updatedAt: string;
  }>;
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
