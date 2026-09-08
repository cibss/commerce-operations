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

export type CreateQuotationInput = {
  customerId: string;
  customerName: string;

  items: Array<{
    sku: string;
    name: string;
    quantity: number;
    unitPrice: number;
  }>;

  discount?: number;
  currency?: Currency;
};

export class QuotationDomainError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);

    this.name = "QuotationDomainError";
    this.statusCode = statusCode;
  }
}

export function validateCreateQuotationInput(input: CreateQuotationInput) {
  if (!input.customerId.trim()) {
    throw new QuotationDomainError("Customer ID is required.");
  }

  if (!input.customerName.trim()) {
    throw new QuotationDomainError("Customer name is required.");
  }

  if (input.items.length === 0) {
    throw new QuotationDomainError(
      "A quotation must contain at least one item.",
    );
  }

  for (const item of input.items) {
    if (!item.sku.trim()) {
      throw new QuotationDomainError("Item SKU is required.");
    }

    if (!item.name.trim()) {
      throw new QuotationDomainError("Item name is required.");
    }

    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      throw new QuotationDomainError(
        "Item quantity must be a positive integer.",
      );
    }

    if (!Number.isFinite(item.unitPrice) || item.unitPrice <= 0) {
      throw new QuotationDomainError(
        "Item unit price must be greater than zero.",
      );
    }
  }

  if (
    input.discount !== undefined &&
    (!Number.isFinite(input.discount) || input.discount < 0)
  ) {
    throw new QuotationDomainError("Discount cannot be negative.");
  }
}

export function assertQuotationTransition(
  quotationId: string,
  currentStatus: QuotationStatus,
  expectedStatus: QuotationStatus,
  nextStatus: QuotationStatus,
) {
  if (currentStatus !== expectedStatus) {
    throw new QuotationDomainError(
      `Quotation ${quotationId} cannot transition from ${currentStatus} to ${nextStatus}.`,
      409,
    );
  }
}
