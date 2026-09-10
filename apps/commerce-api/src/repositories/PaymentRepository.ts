import { and, desc, eq, inArray, like, sql } from "drizzle-orm";

import { getDatabase } from "@/db/client";
import { payments } from "@/db/schema";
import type { DatabaseTransaction } from "@/db/types";
import type {
  Currency,
  Payment,
  PaymentMethod,
  PaymentStatus,
} from "@/lib/payments";

type PaymentRow = typeof payments.$inferSelect;

export type PaymentIdentity = {
  paymentId: string;
};

function mapPaymentRow(row: PaymentRow): Payment {
  return {
    id: row.id,
    orderId: row.orderId,
    amount: row.amount,
    currency: row.currency as Currency,
    method: row.method as PaymentMethod,
    status: row.status as PaymentStatus,
    reference: row.reference,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    paidAt: row.paidAt?.toISOString() ?? null,
    refundedAt: row.refundedAt?.toISOString() ?? null,
  };
}

function getSequenceNumber(id: string | undefined) {
  if (!id) {
    return 0;
  }

  const value = id.split("-").at(-1);
  const sequence = Number(value);

  return Number.isInteger(sequence) ? sequence : 0;
}

function getStatusUpdateValues(nextStatus: PaymentStatus, updatedAt: string) {
  const timestamp = new Date(updatedAt);

  const values: {
    status: PaymentStatus;
    updatedAt: Date;
    paidAt?: Date;
    refundedAt?: Date;
  } = {
    status: nextStatus,
    updatedAt: timestamp,
  };

  if (nextStatus === "PAID") {
    values.paidAt = timestamp;
  }

  if (nextStatus === "REFUNDED") {
    values.refundedAt = timestamp;
  }

  return values;
}

async function list(): Promise<Payment[]> {
  const db = getDatabase();

  const rows = await db
    .select()
    .from(payments)
    .orderBy(desc(payments.createdAt));

  return rows.map(mapPaymentRow);
}

async function findById(paymentId: string): Promise<Payment | null> {
  const db = getDatabase();

  const [row] = await db
    .select()
    .from(payments)
    .where(eq(payments.id, paymentId))
    .limit(1);

  if (!row) {
    return null;
  }

  return mapPaymentRow(row);
}

async function findByOrderId(orderId: string): Promise<Payment | null> {
  const db = getDatabase();

  const [row] = await db
    .select()
    .from(payments)
    .where(eq(payments.orderId, orderId))
    .limit(1);

  if (!row) {
    return null;
  }

  return mapPaymentRow(row);
}

async function findByOrderIdInTransaction(
  transaction: DatabaseTransaction,
  orderId: string,
): Promise<Payment | null> {
  const [row] = await transaction
    .select()
    .from(payments)
    .where(eq(payments.orderId, orderId))
    .limit(1);

  if (!row) {
    return null;
  }

  return mapPaymentRow(row);
}

async function allocateIdentityInTransaction(
  transaction: DatabaseTransaction,
): Promise<PaymentIdentity> {
  await transaction.execute(
    sql`
      SELECT pg_advisory_xact_lock(
        hashtext('commerce:payment-identity')
      )
    `,
  );

  const year = new Date().getUTCFullYear();

  const [latestPayment] = await transaction
    .select({
      id: payments.id,
    })
    .from(payments)
    .where(like(payments.id, `PAY-${year}-%`))
    .orderBy(desc(payments.id))
    .limit(1);

  const paymentSequence = getSequenceNumber(latestPayment?.id) + 1;

  return {
    paymentId: `PAY-${year}-${String(paymentSequence).padStart(4, "0")}`,
  };
}

async function insertInTransaction(
  transaction: DatabaseTransaction,
  payment: Payment,
) {
  await transaction.insert(payments).values({
    id: payment.id,
    orderId: payment.orderId,
    amount: payment.amount,
    currency: payment.currency,
    method: payment.method,
    status: payment.status,
    reference: payment.reference,
    createdAt: new Date(payment.createdAt),
    updatedAt: new Date(payment.updatedAt),
    paidAt: payment.paidAt ? new Date(payment.paidAt) : null,
    refundedAt: payment.refundedAt ? new Date(payment.refundedAt) : null,
  });
}

async function updateStatusInTransaction(
  transaction: DatabaseTransaction,
  paymentId: string,
  expectedStatuses: PaymentStatus[],
  nextStatus: PaymentStatus,
  updatedAt: string,
): Promise<boolean> {
  if (expectedStatuses.length === 0) {
    return false;
  }

  const rows = await transaction
    .update(payments)
    .set(getStatusUpdateValues(nextStatus, updatedAt))
    .where(
      and(
        eq(payments.id, paymentId),
        inArray(payments.status, expectedStatuses),
      ),
    )
    .returning({
      id: payments.id,
    });

  return rows.length > 0;
}

async function updateStatus(
  paymentId: string,
  expectedStatuses: PaymentStatus[],
  nextStatus: PaymentStatus,
  updatedAt: string,
): Promise<boolean> {
  if (expectedStatuses.length === 0) {
    return false;
  }

  const db = getDatabase();

  const rows = await db
    .update(payments)
    .set(getStatusUpdateValues(nextStatus, updatedAt))
    .where(
      and(
        eq(payments.id, paymentId),
        inArray(payments.status, expectedStatuses),
      ),
    )
    .returning({
      id: payments.id,
    });

  return rows.length > 0;
}

export const PaymentRepository = {
  list,
  findById,
  findByOrderId,
  findByOrderIdInTransaction,
  allocateIdentityInTransaction,
  insertInTransaction,
  updateStatusInTransaction,
  updateStatus,
};
