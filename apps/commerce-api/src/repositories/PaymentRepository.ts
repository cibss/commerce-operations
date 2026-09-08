import { and, desc, eq, inArray } from "drizzle-orm";

import { getDatabase } from "@/db/client";
import { payments } from "@/db/schema";
import type {
  Currency,
  Payment,
  PaymentMethod,
  PaymentStatus,
} from "@/lib/payments";

type PaymentRow = typeof payments.$inferSelect;

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

  const rows = await db
    .update(payments)
    .set(values)
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
  updateStatus,
};
