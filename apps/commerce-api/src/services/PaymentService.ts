import {
  assertPaymentTransition,
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
  markPaid,
  markFailed,
  refund,
};
