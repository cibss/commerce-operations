import type { DatabaseTransaction } from "@/db/types";
import {
  assertPaymentTransition,
  type CreatePaymentForOrderInput,
  type Payment,
  PaymentDomainError,
  type PaymentStatus,
} from "@/lib/payments";
import { PaymentRepository } from "@/repositories/PaymentRepository";

async function list(): Promise<Payment[]> {
  return PaymentRepository.list();
}

async function getById(paymentId: string): Promise<Payment> {
  const payment = await PaymentRepository.findById(paymentId);

  if (!payment) {
    throw new PaymentDomainError(`Payment ${paymentId} was not found.`, 404);
  }

  return payment;
}

async function findByOrderId(orderId: string): Promise<Payment | null> {
  return PaymentRepository.findByOrderId(orderId);
}

export async function ensurePaymentForOrderInTransaction(
  transaction: DatabaseTransaction,
  input: CreatePaymentForOrderInput,
): Promise<Payment> {
  const existingPayment = await PaymentRepository.findByOrderIdInTransaction(
    transaction,
    input.orderId,
  );

  if (existingPayment) {
    return existingPayment;
  }

  const identity =
    await PaymentRepository.allocateIdentityInTransaction(transaction);

  const timestamp = new Date().toISOString();

  const payment: Payment = {
    id: identity.paymentId,
    orderId: input.orderId,
    amount: input.amount,
    currency: input.currency,
    method: "BANK_TRANSFER",
    status: "PENDING",
    reference: input.orderId.replace(/^ORD-/, "INV-"),
    createdAt: timestamp,
    updatedAt: timestamp,
    paidAt: null,
    refundedAt: null,
  };

  await PaymentRepository.insertInTransaction(transaction, payment);

  return payment;
}

async function handleOrderCancellationInTransaction(
  transaction: DatabaseTransaction,
  orderId: string,
): Promise<Payment | null> {
  const payment = await PaymentRepository.findByOrderIdInTransaction(
    transaction,
    orderId,
  );

  if (!payment) {
    return null;
  }

  if (payment.status === "PAID") {
    throw new PaymentDomainError(
      `Payment ${payment.id} must be refunded before order ${orderId} can be cancelled.`,
      409,
    );
  }

  if (
    payment.status === "FAILED" ||
    payment.status === "REFUNDED" ||
    payment.status === "CANCELLED"
  ) {
    return payment;
  }

  const updated = await PaymentRepository.updateStatusInTransaction(
    transaction,
    payment.id,
    ["PENDING"],
    "CANCELLED",
    new Date().toISOString(),
  );

  if (!updated) {
    const currentPayment = await PaymentRepository.findByOrderIdInTransaction(
      transaction,
      orderId,
    );

    if (!currentPayment) {
      throw new PaymentDomainError(
        `Payment for order ${orderId} was not found.`,
        404,
      );
    }

    if (currentPayment.status === "PAID") {
      throw new PaymentDomainError(
        `Payment ${currentPayment.id} must be refunded before order ${orderId} can be cancelled.`,
        409,
      );
    }

    if (
      currentPayment.status === "FAILED" ||
      currentPayment.status === "REFUNDED" ||
      currentPayment.status === "CANCELLED"
    ) {
      return currentPayment;
    }

    throw new PaymentDomainError(
      `Payment ${currentPayment.id} could not be cancelled.`,
      409,
    );
  }

  const cancelledPayment = await PaymentRepository.findByOrderIdInTransaction(
    transaction,
    orderId,
  );

  if (!cancelledPayment) {
    throw new PaymentDomainError(
      `Payment for order ${orderId} could not be loaded after cancellation.`,
      409,
    );
  }

  return cancelledPayment;
}

async function transition(
  paymentId: string,
  expectedStatuses: PaymentStatus[],
  nextStatus: PaymentStatus,
): Promise<Payment> {
  const updated = await PaymentRepository.updateStatus(
    paymentId,
    expectedStatuses,
    nextStatus,
    new Date().toISOString(),
  );

  if (!updated) {
    const current = await PaymentRepository.findById(paymentId);

    if (!current) {
      throw new PaymentDomainError(`Payment ${paymentId} was not found.`, 404);
    }

    assertPaymentTransition(
      paymentId,
      current.status,
      expectedStatuses,
      nextStatus,
    );

    throw new PaymentDomainError(
      `Payment ${paymentId} could not be updated.`,
      409,
    );
  }

  return getById(paymentId);
}

async function markPaid(paymentId: string) {
  return transition(paymentId, ["PENDING"], "PAID");
}

async function markFailed(paymentId: string) {
  return transition(paymentId, ["PENDING"], "FAILED");
}

async function refund(paymentId: string) {
  return transition(paymentId, ["PAID"], "REFUNDED");
}

export const PaymentService = {
  list,
  getById,
  findByOrderId,
  ensureForOrderInTransaction: ensurePaymentForOrderInTransaction,
  handleOrderCancellationInTransaction,
  markPaid,
  markFailed,
  refund,
};
