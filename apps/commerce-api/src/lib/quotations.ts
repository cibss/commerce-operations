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

const seedQuotations: Quotation[] = [
  {
    id: "QT-2026-0042",
    customerId: "CUST-0192",
    customerName: "PT Nusantara Teknologi",
    items: [
      {
        id: "ITEM-001",
        sku: "MBP-M4-14",
        name: "MacBook Pro 14 M4",
        quantity: 10,
        unitPrice: 30_000_000,
        lineTotal: 300_000_000,
      },
      {
        id: "ITEM-002",
        sku: "DOCK-USBC",
        name: "USB-C Dock",
        quantity: 10,
        unitPrice: 2_000_000,
        lineTotal: 20_000_000,
      },
    ],
    subtotal: 320_000_000,
    discount: 10_000_000,
    total: 310_000_000,
    currency: "IDR",
    status: "ACCEPTED",
    convertedOrderId: null,
    createdAt: "2026-08-28T09:30:00.000Z",
    updatedAt: "2026-08-30T04:15:00.000Z",
  },
  {
    id: "QT-2026-0041",
    customerId: "CUST-0188",
    customerName: "PT Sinar Digital Indonesia",
    items: [
      {
        id: "ITEM-003",
        sku: "MON-4K-27",
        name: "27-inch 4K Monitor",
        quantity: 15,
        unitPrice: 6_500_000,
        lineTotal: 97_500_000,
      },
    ],
    subtotal: 97_500_000,
    discount: 2_500_000,
    total: 95_000_000,
    currency: "IDR",
    status: "SENT",
    convertedOrderId: null,
    createdAt: "2026-08-26T02:00:00.000Z",
    updatedAt: "2026-08-27T06:30:00.000Z",
  },
  {
    id: "QT-2026-0040",
    customerId: "CUST-0179",
    customerName: "PT Aruna Commerce",
    items: [
      {
        id: "ITEM-004",
        sku: "LAPTOP-BIZ-01",
        name: "Business Laptop",
        quantity: 20,
        unitPrice: 14_000_000,
        lineTotal: 280_000_000,
      },
    ],
    subtotal: 280_000_000,
    discount: 0,
    total: 280_000_000,
    currency: "IDR",
    status: "DRAFT",
    convertedOrderId: null,
    createdAt: "2026-08-24T08:00:00.000Z",
    updatedAt: "2026-08-24T08:00:00.000Z",
  },
];

const quotations = new Map<string, Quotation>(
  seedQuotations.map((quotation) => [quotation.id, quotation]),
);

let quotationSequence = 43;
let customerSequence = 193;
let itemSequence = 5;

function cloneQuotation(quotation: Quotation): Quotation {
  return structuredClone(quotation);
}

function getQuotationOrThrow(id: string): Quotation {
  const quotation = quotations.get(id);

  if (!quotation) {
    throw new QuotationDomainError(`Quotation ${id} was not found.`, 404);
  }

  return quotation;
}

function generateQuotationId() {
  const year = new Date().getFullYear();

  const id = `QT-${year}-${String(quotationSequence).padStart(4, "0")}`;

  quotationSequence += 1;

  return id;
}

function generateCustomerId() {
  const id = `CUST-${String(customerSequence).padStart(4, "0")}`;

  customerSequence += 1;

  return id;
}

function generateItemId() {
  const id = `ITEM-${String(itemSequence).padStart(3, "0")}`;

  itemSequence += 1;

  return id;
}

function validateCreateInput(input: CreateQuotationInput) {
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

function transitionQuotation(
  id: string,
  from: QuotationStatus,
  to: QuotationStatus,
): Quotation {
  const quotation = getQuotationOrThrow(id);

  if (quotation.status !== from) {
    throw new QuotationDomainError(
      `Quotation ${id} cannot transition from ${quotation.status} to ${to}.`,
      409,
    );
  }

  const updatedQuotation: Quotation = {
    ...quotation,
    status: to,
    updatedAt: new Date().toISOString(),
  };

  quotations.set(id, updatedQuotation);

  return cloneQuotation(updatedQuotation);
}

export function listQuotations(): Quotation[] {
  return Array.from(quotations.values())
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(cloneQuotation);
}

export function getQuotation(id: string): Quotation {
  return cloneQuotation(getQuotationOrThrow(id));
}

export function createQuotation(input: CreateQuotationInput): Quotation {
  validateCreateInput(input);

  const items: QuotationItem[] = input.items.map((item) => ({
    id: generateItemId(),
    sku: item.sku.trim(),
    name: item.name.trim(),
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    lineTotal: item.quantity * item.unitPrice,
  }));

  const subtotal = items.reduce((total, item) => total + item.lineTotal, 0);

  const discount = input.discount ?? 0;

  if (discount > subtotal) {
    throw new QuotationDomainError("Discount cannot be greater than subtotal.");
  }

  const timestamp = new Date().toISOString();

  const quotation: Quotation = {
    id: generateQuotationId(),
    customerId: generateCustomerId(),
    customerName: input.customerName.trim(),
    items,
    subtotal,
    discount,
    total: subtotal - discount,
    currency: input.currency ?? "IDR",
    status: "DRAFT",
    convertedOrderId: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  quotations.set(quotation.id, quotation);

  return cloneQuotation(quotation);
}

export function sendQuotation(id: string): Quotation {
  return transitionQuotation(id, "DRAFT", "SENT");
}

export function acceptQuotation(id: string): Quotation {
  return transitionQuotation(id, "SENT", "ACCEPTED");
}

export function rejectQuotation(id: string): Quotation {
  return transitionQuotation(id, "SENT", "REJECTED");
}
