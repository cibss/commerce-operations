import { beforeEach, describe, expect, it, vi } from "vitest";

describe("payment domain", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("moves a payment from PENDING to PAID to REFUNDED", async () => {
    const { getPayment, markPaymentPaid, refundPayment } =
      await import("@/lib/payments");

    expect(getPayment("PAY-2026-0091").status).toBe("PENDING");

    const paidPayment = markPaymentPaid("PAY-2026-0091");

    expect(paidPayment.status).toBe("PAID");

    expect(paidPayment.paidAt).not.toBeNull();

    const refundedPayment = refundPayment("PAY-2026-0091");

    expect(refundedPayment.status).toBe("REFUNDED");

    expect(refundedPayment.refundedAt).not.toBeNull();
  });

  it("allows a pending payment to fail", async () => {
    const { markPaymentFailed } = await import("@/lib/payments");

    const failedPayment = markPaymentFailed("PAY-2026-0091");

    expect(failedPayment.status).toBe("FAILED");
  });

  it("rejects refunding an unpaid transaction", async () => {
    const { PaymentDomainError, refundPayment } =
      await import("@/lib/payments");

    expect(() => refundPayment("PAY-2026-0091")).toThrow(PaymentDomainError);

    expect(() => refundPayment("PAY-2026-0091")).toThrow(
      "Payment PAY-2026-0091 cannot transition from PENDING to REFUNDED.",
    );
  });
});
