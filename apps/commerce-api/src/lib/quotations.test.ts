import { describe, expect, it } from "vitest";

import {
  assertQuotationTransition,
  QuotationDomainError,
  validateCreateQuotationInput,
} from "@/lib/quotations";

describe("quotation domain", () => {
  it("allows DRAFT to transition to SENT", () => {
    expect(() =>
      assertQuotationTransition("QT-2026-0040", "DRAFT", "DRAFT", "SENT"),
    ).not.toThrow();
  });

  it("allows SENT to transition to ACCEPTED", () => {
    expect(() =>
      assertQuotationTransition("QT-2026-0040", "SENT", "SENT", "ACCEPTED"),
    ).not.toThrow();
  });

  it("rejects DRAFT to ACCEPTED", () => {
    expect(() =>
      assertQuotationTransition("QT-2026-0040", "DRAFT", "SENT", "ACCEPTED"),
    ).toThrow(QuotationDomainError);

    expect(() =>
      assertQuotationTransition("QT-2026-0040", "DRAFT", "SENT", "ACCEPTED"),
    ).toThrow(
      "Quotation QT-2026-0040 cannot transition from DRAFT to ACCEPTED.",
    );
  });

  it("rejects empty quotation items", () => {
    expect(() =>
      validateCreateQuotationInput({
        customerId: "CUST-0192",

        customerName: "PT Nusantara Teknologi",

        items: [],
      }),
    ).toThrow("A quotation must contain at least one item.");
  });

  it("rejects invalid item quantity", () => {
    expect(() =>
      validateCreateQuotationInput({
        customerId: "CUST-0192",

        customerName: "PT Nusantara Teknologi",

        items: [
          {
            sku: "SKU-001",
            name: "Test Product",
            quantity: 0,
            unitPrice: 100_000,
          },
        ],
      }),
    ).toThrow("Item quantity must be a positive integer.");
  });
});
