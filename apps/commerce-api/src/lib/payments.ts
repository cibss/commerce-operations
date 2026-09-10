export type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "REFUNDED"
  | "CANCELLED";

export type PaymentMethod = "BANK_TRANSFER" | "VIRTUAL_ACCOUNT" | "CARD";

export type Currency = "IDR";

export type Payment = {
  id: string;
  orderId: string;
  amount: number;
  currency: Currency;
  method: PaymentMethod;
  status: PaymentStatus;
  reference: string;
  createdAt: string;
  updatedAt: string;
  paidAt: string | null;
  refundedAt: string | null;
};

export type CreatePaymentForOrderInput = {
  orderId: string;
  amount: number;
  currency: Currency;
};

export class PaymentDomainError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);

    this.name = "PaymentDomainError";
    this.statusCode = statusCode;
  }
}

export function assertPaymentTransition(
  paymentId: string,
  currentStatus: PaymentStatus,
  allowedStatuses: PaymentStatus[],
  nextStatus: PaymentStatus,
) {
  if (!allowedStatuses.includes(currentStatus)) {
    throw new PaymentDomainError(
      `Payment ${paymentId} cannot transition from ${currentStatus} to ${nextStatus}.`,
      409,
    );
  }
}
