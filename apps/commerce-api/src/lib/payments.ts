export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

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

export class PaymentDomainError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);

    this.name = "PaymentDomainError";
    this.statusCode = statusCode;
  }
}

const seedPayments: Payment[] = [
  {
    id: "PAY-2026-0091",
    orderId: "ORD-2026-0181",
    amount: 160_000_000,
    currency: "IDR",
    method: "BANK_TRANSFER",
    status: "PENDING",
    reference: "INV-2026-0181",
    createdAt: "2026-08-27T03:15:00.000Z",
    updatedAt: "2026-08-27T03:15:00.000Z",
    paidAt: null,
    refundedAt: null,
  },
  {
    id: "PAY-2026-0090",
    orderId: "ORD-2026-0180",
    amount: 165_000_000,
    currency: "IDR",
    method: "VIRTUAL_ACCOUNT",
    status: "PAID",
    reference: "INV-2026-0180",
    createdAt: "2026-08-25T04:45:00.000Z",
    updatedAt: "2026-08-26T02:00:00.000Z",
    paidAt: "2026-08-26T02:00:00.000Z",
    refundedAt: null,
  },
  {
    id: "PAY-2026-0089",
    orderId: "ORD-2026-0179",
    amount: 150_000_000,
    currency: "IDR",
    method: "CARD",
    status: "PAID",
    reference: "INV-2026-0179",
    createdAt: "2026-08-22T02:30:00.000Z",
    updatedAt: "2026-08-22T06:15:00.000Z",
    paidAt: "2026-08-22T06:15:00.000Z",
    refundedAt: null,
  },
];

const payments = new Map<string, Payment>(
  seedPayments.map((payment) => [payment.id, payment]),
);

function clonePayment(payment: Payment): Payment {
  return structuredClone(payment);
}

function getPaymentOrThrow(id: string): Payment {
  const payment = payments.get(id);

  if (!payment) {
    throw new PaymentDomainError(`Payment ${id} was not found.`, 404);
  }

  return payment;
}

function transitionPayment(
  id: string,
  allowedFrom: PaymentStatus[],
  to: PaymentStatus,
): Payment {
  const payment = getPaymentOrThrow(id);

  if (!allowedFrom.includes(payment.status)) {
    throw new PaymentDomainError(
      `Payment ${id} cannot transition from ${payment.status} to ${to}.`,
      409,
    );
  }

  const timestamp = new Date().toISOString();

  const updatedPayment: Payment = {
    ...payment,
    status: to,
    updatedAt: timestamp,
    paidAt: to === "PAID" ? timestamp : payment.paidAt,
    refundedAt: to === "REFUNDED" ? timestamp : payment.refundedAt,
  };

  payments.set(id, updatedPayment);

  return clonePayment(updatedPayment);
}

export function listPayments(): Payment[] {
  return Array.from(payments.values())
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(clonePayment);
}

export function getPayment(id: string): Payment {
  return clonePayment(getPaymentOrThrow(id));
}

export function markPaymentPaid(id: string): Payment {
  return transitionPayment(id, ["PENDING"], "PAID");
}

export function markPaymentFailed(id: string): Payment {
  return transitionPayment(id, ["PENDING"], "FAILED");
}

export function refundPayment(id: string): Payment {
  return transitionPayment(id, ["PAID"], "REFUNDED");
}
