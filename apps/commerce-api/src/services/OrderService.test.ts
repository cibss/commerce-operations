import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Order } from "@/lib/orders";
import type { Payment } from "@/lib/payments";

const mocks = vi.hoisted(() => ({
  transaction: vi.fn(),

  findOrderById: vi.fn(),
  findOrderByIdInTransaction: vi.fn(),

  updateOrderStatus: vi.fn(),
  updateOrderStatusInTransaction: vi.fn(),

  findPaymentByOrderId: vi.fn(),
  ensurePaymentForOrder: vi.fn(),
  handleOrderCancellation: vi.fn(),
}));

vi.mock("@/db/client", () => ({
  getDatabase: () => ({
    transaction: mocks.transaction,
  }),
}));

vi.mock("@/repositories/OrderRepository", () => ({
  OrderRepository: {
    list: vi.fn(),

    findById: mocks.findOrderById,

    findByIdInTransaction: mocks.findOrderByIdInTransaction,

    findBySourceQuotationIdInTransaction: vi.fn(),

    allocateIdentityInTransaction: vi.fn(),

    insertInTransaction: vi.fn(),

    updateStatus: mocks.updateOrderStatus,

    updateStatusInTransaction: mocks.updateOrderStatusInTransaction,
  },
}));

vi.mock("@/services/PaymentService", () => ({
  PaymentService: {
    findByOrderId: mocks.findPaymentByOrderId,

    ensureForOrderInTransaction: mocks.ensurePaymentForOrder,

    handleOrderCancellationInTransaction: mocks.handleOrderCancellation,
  },
}));

const transaction = {};

const confirmedOrder: Order = {
  id: "ORD-2026-0182",
  sourceQuotationId: "QT-2026-0043",
  customerId: "CUST-0192",
  customerName: "PT Nusantara Teknologi",
  items: [
    {
      id: "ORDER-ITEM-005",
      sku: "E2E-MONITOR-01",
      name: "E2E Test Monitor",
      quantity: 2,
      unitPrice: 5_000_000,
      lineTotal: 10_000_000,
    },
  ],
  subtotal: 10_000_000,
  discount: 1_000_000,
  total: 9_000_000,
  currency: "IDR",
  status: "CONFIRMED",
  createdAt: "2026-09-10T00:00:00.000Z",
  updatedAt: "2026-09-10T00:01:00.000Z",
};

const processingOrder: Order = {
  ...confirmedOrder,
  status: "PROCESSING",
  updatedAt: "2026-09-10T00:02:00.000Z",
};

const cancelledOrder: Order = {
  ...confirmedOrder,
  status: "CANCELLED",
  updatedAt: "2026-09-10T00:02:00.000Z",
};

const pendingPayment: Payment = {
  id: "PAY-2026-0092",
  orderId: confirmedOrder.id,
  amount: confirmedOrder.total,
  currency: "IDR",
  method: "BANK_TRANSFER",
  status: "PENDING",
  reference: "INV-2026-0182",
  createdAt: "2026-09-10T00:01:00.000Z",
  updatedAt: "2026-09-10T00:01:00.000Z",
  paidAt: null,
  refundedAt: null,
};

const paidPayment: Payment = {
  ...pendingPayment,
  status: "PAID",
  updatedAt: "2026-09-10T00:02:00.000Z",
  paidAt: "2026-09-10T00:02:00.000Z",
};

const cancelledPayment: Payment = {
  ...pendingPayment,
  status: "CANCELLED",
  updatedAt: "2026-09-10T00:02:00.000Z",
};

describe("OrderService payment workflow", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.transaction.mockImplementation(
      async (callback: (transaction: object) => Promise<unknown>) =>
        callback(transaction),
    );
  });

  it("returns the payment created when an order is confirmed", async () => {
    mocks.updateOrderStatusInTransaction.mockResolvedValue(true);

    mocks.findOrderByIdInTransaction.mockResolvedValue(confirmedOrder);

    mocks.ensurePaymentForOrder.mockResolvedValue(pendingPayment);

    const { OrderService } = await import("@/services/OrderService");

    const result = await OrderService.confirm(confirmedOrder.id);

    expect(result).toEqual({
      order: confirmedOrder,
      paymentId: pendingPayment.id,
    });

    expect(mocks.ensurePaymentForOrder).toHaveBeenCalledWith(transaction, {
      orderId: confirmedOrder.id,
      amount: confirmedOrder.total,
      currency: confirmedOrder.currency,
    });
  });

  it("blocks processing while payment is pending", async () => {
    mocks.findOrderById.mockResolvedValue(confirmedOrder);

    mocks.findPaymentByOrderId.mockResolvedValue(pendingPayment);

    const { OrderService } = await import("@/services/OrderService");

    await expect(OrderService.process(confirmedOrder.id)).rejects.toThrow(
      `Order ${confirmedOrder.id} cannot start processing until payment is PAID. Current payment status: PENDING.`,
    );

    expect(mocks.updateOrderStatus).not.toHaveBeenCalled();
  });

  it("allows processing after payment is paid", async () => {
    mocks.findOrderById
      .mockResolvedValueOnce(confirmedOrder)
      .mockResolvedValueOnce(processingOrder);

    mocks.findPaymentByOrderId.mockResolvedValue(paidPayment);

    mocks.updateOrderStatus.mockResolvedValue(true);

    const { OrderService } = await import("@/services/OrderService");

    const result = await OrderService.process(confirmedOrder.id);

    expect(result).toEqual(processingOrder);

    expect(mocks.updateOrderStatus).toHaveBeenCalledWith(
      confirmedOrder.id,
      ["CONFIRMED"],
      "PROCESSING",
      expect.any(String),
    );
  });

  it("cancels the related pending payment with a confirmed order", async () => {
    mocks.findOrderByIdInTransaction
      .mockResolvedValueOnce(confirmedOrder)
      .mockResolvedValueOnce(cancelledOrder);

    mocks.handleOrderCancellation.mockResolvedValue(cancelledPayment);

    mocks.updateOrderStatusInTransaction.mockResolvedValue(true);

    const { OrderService } = await import("@/services/OrderService");

    const result = await OrderService.cancel(confirmedOrder.id);

    expect(result).toEqual(cancelledOrder);

    expect(mocks.handleOrderCancellation).toHaveBeenCalledWith(
      transaction,
      confirmedOrder.id,
    );

    expect(mocks.updateOrderStatusInTransaction).toHaveBeenCalledWith(
      transaction,
      confirmedOrder.id,
      ["CONFIRMED"],
      "CANCELLED",
      expect.any(String),
    );
  });

  it("does not cancel the order when payment cancellation fails", async () => {
    mocks.findOrderByIdInTransaction.mockResolvedValue(confirmedOrder);

    mocks.handleOrderCancellation.mockRejectedValue(
      new Error(
        `Payment ${paidPayment.id} must be refunded before order ${confirmedOrder.id} can be cancelled.`,
      ),
    );

    const { OrderService } = await import("@/services/OrderService");

    await expect(OrderService.cancel(confirmedOrder.id)).rejects.toThrow(
      `Payment ${paidPayment.id} must be refunded before order ${confirmedOrder.id} can be cancelled.`,
    );

    expect(mocks.updateOrderStatusInTransaction).not.toHaveBeenCalled();
  });
});
