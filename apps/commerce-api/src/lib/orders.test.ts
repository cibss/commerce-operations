import { describe, expect, it } from "vitest";

import { assertOrderTransition, OrderDomainError } from "@/lib/orders";

describe("order domain", () => {
  it("allows the normal fulfillment lifecycle", () => {
    expect(() =>
      assertOrderTransition(
        "ORD-2026-0181",
        "PENDING",
        ["PENDING"],
        "CONFIRMED",
      ),
    ).not.toThrow();

    expect(() =>
      assertOrderTransition(
        "ORD-2026-0181",
        "CONFIRMED",
        ["CONFIRMED"],
        "PROCESSING",
      ),
    ).not.toThrow();

    expect(() =>
      assertOrderTransition(
        "ORD-2026-0181",
        "PROCESSING",
        ["PROCESSING"],
        "SHIPPED",
      ),
    ).not.toThrow();

    expect(() =>
      assertOrderTransition(
        "ORD-2026-0181",
        "SHIPPED",
        ["SHIPPED"],
        "COMPLETED",
      ),
    ).not.toThrow();
  });

  it("allows cancellation before fulfillment starts", () => {
    expect(() =>
      assertOrderTransition(
        "ORD-2026-0181",
        "CONFIRMED",
        ["PENDING", "CONFIRMED"],
        "CANCELLED",
      ),
    ).not.toThrow();
  });

  it("rejects shipping a PENDING order", () => {
    expect(() =>
      assertOrderTransition(
        "ORD-2026-0181",
        "PENDING",
        ["PROCESSING"],
        "SHIPPED",
      ),
    ).toThrow(OrderDomainError);

    expect(() =>
      assertOrderTransition(
        "ORD-2026-0181",
        "PENDING",
        ["PROCESSING"],
        "SHIPPED",
      ),
    ).toThrow("Order ORD-2026-0181 cannot transition from PENDING to SHIPPED.");
  });
});
