import { describe, expect, it } from "vitest";

import { assertPaymentTransition, PaymentDomainError } from "@/lib/payments";

describe("payment domain", () => {
  it("allows PENDING to transition to PAID", () => {
    expect(() =>
      assertPaymentTransition("PAY-2026-0091", "PENDING", ["PENDING"], "PAID"),
    ).not.toThrow();
  });

  it("allows PAID to transition to REFUNDED", () => {
    expect(() =>
      assertPaymentTransition("PAY-2026-0091", "PAID", ["PAID"], "REFUNDED"),
    ).not.toThrow();
  });

  it("allows PENDING to transition to FAILED", () => {
    expect(() =>
      assertPaymentTransition(
        "PAY-2026-0091",
        "PENDING",
        ["PENDING"],
        "FAILED",
      ),
    ).not.toThrow();
  });

  it("rejects refunding a PENDING payment", () => {
    expect(() =>
      assertPaymentTransition("PAY-2026-0091", "PENDING", ["PAID"], "REFUNDED"),
    ).toThrow(PaymentDomainError);

    expect(() =>
      assertPaymentTransition("PAY-2026-0091", "PENDING", ["PAID"], "REFUNDED"),
    ).toThrow(
      "Payment PAY-2026-0091 cannot transition from PENDING to REFUNDED.",
    );
  });

  it("rejects marking an already paid payment as failed", () => {
    expect(() =>
      assertPaymentTransition("PAY-2026-0091", "PAID", ["PENDING"], "FAILED"),
    ).toThrow("Payment PAY-2026-0091 cannot transition from PAID to FAILED.");
  });
});
