import { beforeEach, describe, expect, it, vi } from "vitest";

describe("order domain", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("runs the full order fulfillment lifecycle", async () => {
    const { completeOrder, confirmOrder, getOrder, processOrder, shipOrder } =
      await import("@/lib/orders");

    expect(getOrder("ORD-2026-0181").status).toBe("PENDING");

    expect(confirmOrder("ORD-2026-0181").status).toBe("CONFIRMED");

    expect(processOrder("ORD-2026-0181").status).toBe("PROCESSING");

    expect(shipOrder("ORD-2026-0181").status).toBe("SHIPPED");

    expect(completeOrder("ORD-2026-0181").status).toBe("COMPLETED");
  });

  it("allows cancellation before fulfillment starts", async () => {
    const { cancelOrder, confirmOrder } = await import("@/lib/orders");

    confirmOrder("ORD-2026-0181");

    const cancelledOrder = cancelOrder("ORD-2026-0181");

    expect(cancelledOrder.status).toBe("CANCELLED");
  });

  it("rejects shipping a PENDING order", async () => {
    const { OrderDomainError, shipOrder } = await import("@/lib/orders");

    expect(() => shipOrder("ORD-2026-0181")).toThrow(OrderDomainError);

    expect(() => shipOrder("ORD-2026-0181")).toThrow(
      "Order ORD-2026-0181 cannot transition from PENDING to SHIPPED.",
    );
  });
});
