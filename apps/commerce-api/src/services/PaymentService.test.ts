import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DatabaseTransaction } from "@/db/types";
import type { Payment } from "@/lib/payments";

const mocks = vi.hoisted(() => ({
  findByOrderIdInTransaction: vi.fn(),
  updateStatusInTransaction: vi.fn(),
}));

vi.mock("@/repositories/PaymentRepository", () => ({
  PaymentRepository: {
    list: vi.fn(),
    findById: vi.fn(),
    findByOrderId: vi.fn(),

    findByOrderIdInTransaction: mocks.findByOrderIdInTransaction,

    allocateIdentityInTransaction: vi.fn(),
    insertInTransaction: vi.fn(),

    updateStatusInTransaction: mocks.updateStatusInTransaction,

    updateStatus: vi.fn(),
  },
}));

const transaction = {} as DatabaseTransaction;

const pendingPayment: Payment = {
  id: "PAY-2026-0092",
  orderId: "ORD-2026-0182",
  amount: 9_000_000,
  currency: "IDR",
  method: "BANK_TRANSFER",
  status: "PENDING",
  reference: "INV-2026-0182",
  createdAt: "2026-09-10T00:00:00.000Z",
  updatedAt: "2026-09-10T00:00:00.000Z",
  paidAt: null,
  refundedAt: null,
};

const cancelledPayment: Payment = {
  ...pendingPayment,
  status: "CANCELLED",
  updatedAt: "2026-09-10T00:01:00.000Z",
};

const paidPayment: Payment = {
  ...pendingPayment,
  status: "PAID",
  updatedAt: "2026-09-10T00:01:00.000Z",
  paidAt: "2026-09-10T00:01:00.000Z",
};

describe("PaymentService order cancellation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("cancels a pending payment with its order", async () => {
    mocks.findByOrderIdInTransaction
      .mockResolvedValueOnce(pendingPayment)
      .mockResolvedValueOnce(cancelledPayment);

    mocks.updateStatusInTransaction.mockResolvedValue(true);

    const { PaymentService } = await import("@/services/PaymentService");

    const result = await PaymentService.handleOrderCancellationInTransaction(
      transaction,
      pendingPayment.orderId,
    );

    expect(result).toEqual(cancelledPayment);

    expect(mocks.updateStatusInTransaction).toHaveBeenCalledWith(
      transaction,
      pendingPayment.id,
      ["PENDING"],
      "CANCELLED",
      expect.any(String),
    );
  });

  it("requires a paid payment to be refunded before cancellation", async () => {
    mocks.findByOrderIdInTransaction.mockResolvedValue(paidPayment);

    const { PaymentService } = await import("@/services/PaymentService");

    await expect(
      PaymentService.handleOrderCancellationInTransaction(
        transaction,
        paidPayment.orderId,
      ),
    ).rejects.toThrow(
      `Payment ${paidPayment.id} must be refunded before order ${paidPayment.orderId} can be cancelled.`,
    );

    expect(mocks.updateStatusInTransaction).not.toHaveBeenCalled();
  });

  it("preserves a failed payment when its order is cancelled", async () => {
    const failedPayment: Payment = {
      ...pendingPayment,
      status: "FAILED",
    };

    mocks.findByOrderIdInTransaction.mockResolvedValue(failedPayment);

    const { PaymentService } = await import("@/services/PaymentService");

    const result = await PaymentService.handleOrderCancellationInTransaction(
      transaction,
      failedPayment.orderId,
    );

    expect(result).toEqual(failedPayment);

    expect(mocks.updateStatusInTransaction).not.toHaveBeenCalled();
  });

  it("preserves a refunded payment when its order is cancelled", async () => {
    const refundedPayment: Payment = {
      ...paidPayment,
      status: "REFUNDED",
      refundedAt: "2026-09-10T00:02:00.000Z",
    };

    mocks.findByOrderIdInTransaction.mockResolvedValue(refundedPayment);

    const { PaymentService } = await import("@/services/PaymentService");

    const result = await PaymentService.handleOrderCancellationInTransaction(
      transaction,
      refundedPayment.orderId,
    );

    expect(result).toEqual(refundedPayment);

    expect(mocks.updateStatusInTransaction).not.toHaveBeenCalled();
  });
});
