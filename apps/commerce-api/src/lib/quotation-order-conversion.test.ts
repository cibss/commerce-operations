import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Order } from "@/lib/orders";
import type { Quotation } from "@/lib/quotations";

const mocks = vi.hoisted(() => ({
  transaction: vi.fn(),

  lockQuotation: vi.fn(),

  findQuotation: vi.fn(),

  markConverted: vi.fn(),

  findOrderById: vi.fn(),

  findOrderByQuotation: vi.fn(),

  createOrder: vi.fn(),
}));

vi.mock("@/db/client", () => ({
  getDatabase: () => ({
    transaction: mocks.transaction,
  }),
}));

vi.mock("@/repositories/QuotationRepository", () => ({
  QuotationRepository: {
    lockByIdInTransaction: mocks.lockQuotation,

    findByIdInTransaction: mocks.findQuotation,

    markConvertedInTransaction: mocks.markConverted,
  },
}));

vi.mock("@/repositories/OrderRepository", () => ({
  OrderRepository: {
    findByIdInTransaction: mocks.findOrderById,

    findBySourceQuotationIdInTransaction: mocks.findOrderByQuotation,
  },
}));

vi.mock("@/services/OrderService", () => ({
  createOrderFromQuotationInTransaction: mocks.createOrder,
}));

const acceptedQuotation: Quotation = {
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
  ],

  subtotal: 300_000_000,

  discount: 0,

  total: 300_000_000,

  currency: "IDR",

  status: "ACCEPTED",

  convertedOrderId: null,

  createdAt: "2026-08-28T09:30:00.000Z",

  updatedAt: "2026-08-30T04:15:00.000Z",
};

const pendingOrder: Order = {
  id: "ORD-2026-0182",

  sourceQuotationId: "QT-2026-0042",

  customerId: "CUST-0192",

  customerName: "PT Nusantara Teknologi",

  items: [
    {
      id: "ORDER-ITEM-005",

      sku: "MBP-M4-14",

      name: "MacBook Pro 14 M4",

      quantity: 10,

      unitPrice: 30_000_000,

      lineTotal: 300_000_000,
    },
  ],

  subtotal: 300_000_000,

  discount: 0,

  total: 300_000_000,

  currency: "IDR",

  status: "PENDING",

  createdAt: "2026-09-08T00:00:00.000Z",

  updatedAt: "2026-09-08T00:00:00.000Z",
};

describe("quotation to order conversion", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.transaction.mockImplementation(
      async (callback: (transaction: object) => Promise<unknown>) =>
        callback({}),
    );
  });

  it("creates one order and marks the quotation as converted", async () => {
    mocks.findQuotation.mockResolvedValue(acceptedQuotation);

    mocks.findOrderByQuotation.mockResolvedValue(null);

    mocks.createOrder.mockResolvedValue(pendingOrder);

    mocks.markConverted.mockResolvedValue(true);

    const { QuotationOrderConversionService } =
      await import("@/services/QuotationOrderConversionService");

    const result =
      await QuotationOrderConversionService.convert("QT-2026-0042");

    expect(result).toEqual({
      quotationId: "QT-2026-0042",

      orderId: "ORD-2026-0182",
    });

    expect(mocks.createOrder).toHaveBeenCalledTimes(1);

    expect(mocks.markConverted).toHaveBeenCalledTimes(1);
  });

  it("returns the existing order when conversion is retried", async () => {
    mocks.findQuotation.mockResolvedValue({
      ...acceptedQuotation,

      status: "CONVERTED",

      convertedOrderId: "ORD-2026-0182",
    });

    mocks.findOrderById.mockResolvedValue(pendingOrder);

    const { QuotationOrderConversionService } =
      await import("@/services/QuotationOrderConversionService");

    const result =
      await QuotationOrderConversionService.convert("QT-2026-0042");

    expect(result).toEqual({
      quotationId: "QT-2026-0042",

      orderId: "ORD-2026-0182",
    });

    expect(mocks.createOrder).not.toHaveBeenCalled();

    expect(mocks.markConverted).not.toHaveBeenCalled();
  });

  it("rejects conversion before quotation acceptance", async () => {
    mocks.findQuotation.mockResolvedValue({
      ...acceptedQuotation,
      status: "SENT",
    });

    const { QuotationOrderConversionService } =
      await import("@/services/QuotationOrderConversionService");

    await expect(
      QuotationOrderConversionService.convert("QT-2026-0042"),
    ).rejects.toThrow("Quotation QT-2026-0042 cannot be converted from SENT.");

    expect(mocks.createOrder).not.toHaveBeenCalled();
  });
});
