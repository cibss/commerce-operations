import { beforeEach, describe, expect, it, vi } from "vitest";

describe("quotation to order conversion", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("converts an accepted quotation into one pending order", async () => {
    const { convertQuotationToOrder } =
      await import("@/lib/quotation-order-conversion");

    const { getQuotation } = await import("@/lib/quotations");

    const { getOrder, listOrders } = await import("@/lib/orders");

    const initialOrderCount = listOrders().length;

    const result = convertQuotationToOrder("QT-2026-0042");

    expect(result.quotationId).toBe("QT-2026-0042");

    expect(result.orderId).toMatch(/^ORD-\d{4}-\d{4}$/);

    const quotation = getQuotation("QT-2026-0042");

    expect(quotation.status).toBe("CONVERTED");

    expect(quotation.convertedOrderId).toBe(result.orderId);

    const order = getOrder(result.orderId);

    expect(order.sourceQuotationId).toBe("QT-2026-0042");

    expect(order.customerId).toBe(quotation.customerId);

    expect(order.total).toBe(quotation.total);

    expect(order.status).toBe("PENDING");

    expect(listOrders()).toHaveLength(initialOrderCount + 1);
  });

  it("returns the same order when conversion is retried", async () => {
    const { convertQuotationToOrder } =
      await import("@/lib/quotation-order-conversion");

    const { listOrders } = await import("@/lib/orders");

    const initialOrderCount = listOrders().length;

    const firstResult = convertQuotationToOrder("QT-2026-0042");

    const secondResult = convertQuotationToOrder("QT-2026-0042");

    expect(secondResult).toEqual(firstResult);

    expect(listOrders()).toHaveLength(initialOrderCount + 1);
  });

  it("rejects conversion before a quotation is accepted", async () => {
    const { convertQuotationToOrder } =
      await import("@/lib/quotation-order-conversion");

    const { QuotationDomainError } = await import("@/lib/quotations");

    expect(() => convertQuotationToOrder("QT-2026-0041")).toThrow(
      QuotationDomainError,
    );

    expect(() => convertQuotationToOrder("QT-2026-0041")).toThrow(
      "Quotation QT-2026-0041 cannot be converted from SENT.",
    );
  });
});
