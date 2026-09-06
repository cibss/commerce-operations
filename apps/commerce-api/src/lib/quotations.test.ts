import { beforeEach, describe, expect, it, vi } from "vitest";

describe("quotation domain", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("moves a quotation from DRAFT to SENT to ACCEPTED", async () => {
    const { acceptQuotation, getQuotation, sendQuotation } =
      await import("@/lib/quotations");

    expect(getQuotation("QT-2026-0040").status).toBe("DRAFT");

    const sentQuotation = sendQuotation("QT-2026-0040");

    expect(sentQuotation.status).toBe("SENT");

    const acceptedQuotation = acceptQuotation("QT-2026-0040");

    expect(acceptedQuotation.status).toBe("ACCEPTED");
  });

  it("allows a SENT quotation to be rejected", async () => {
    const { getQuotation, rejectQuotation, sendQuotation } =
      await import("@/lib/quotations");

    sendQuotation("QT-2026-0040");

    const rejectedQuotation = rejectQuotation("QT-2026-0040");

    expect(rejectedQuotation.status).toBe("REJECTED");

    expect(getQuotation("QT-2026-0040").status).toBe("REJECTED");
  });

  it("rejects an invalid DRAFT to ACCEPTED transition", async () => {
    const { acceptQuotation, QuotationDomainError } =
      await import("@/lib/quotations");

    expect(() => acceptQuotation("QT-2026-0040")).toThrow(QuotationDomainError);

    expect(() => acceptQuotation("QT-2026-0040")).toThrow(
      "Quotation QT-2026-0040 cannot transition from DRAFT to ACCEPTED.",
    );
  });

  it("rejects an unknown quotation", async () => {
    const { getQuotation, QuotationDomainError } =
      await import("@/lib/quotations");

    expect(() => getQuotation("QT-UNKNOWN")).toThrow(QuotationDomainError);

    expect(() => getQuotation("QT-UNKNOWN")).toThrow(
      "Quotation QT-UNKNOWN was not found.",
    );
  });
});
