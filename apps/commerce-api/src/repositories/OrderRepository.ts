import { and, desc, eq, inArray, like, sql } from "drizzle-orm";

import { getDatabase } from "@/db/client";
import { orderItems, orders } from "@/db/schema";
import type { DatabaseTransaction } from "@/db/types";
import type { Currency, Order, OrderItem, OrderStatus } from "@/lib/orders";

type OrderRow = typeof orders.$inferSelect;

type OrderItemRow = typeof orderItems.$inferSelect;

export type OrderIdentity = {
  orderId: string;
  itemIds: string[];
};

function mapOrderItemRow(row: OrderItemRow): OrderItem {
  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
    quantity: row.quantity,
    unitPrice: row.unitPrice,
    lineTotal: row.lineTotal,
  };
}

function mapOrderRow(row: OrderRow, items: OrderItem[]): Order {
  return {
    id: row.id,
    sourceQuotationId: row.sourceQuotationId,
    customerId: row.customerId,
    customerName: row.customerName,
    items,
    subtotal: row.subtotal,
    discount: row.discount,
    total: row.total,
    currency: row.currency as Currency,
    status: row.status as OrderStatus,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
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

async function list(): Promise<Order[]> {
  const db = getDatabase();

  const orderRows = await db
    .select()
    .from(orders)
    .orderBy(desc(orders.createdAt));

  if (orderRows.length === 0) {
    return [];
  }

  const orderIds = orderRows.map((order) => order.id);

  const itemRows = await db
    .select()
    .from(orderItems)
    .where(inArray(orderItems.orderId, orderIds));

  const itemsByOrderId = new Map<string, OrderItem[]>();

  for (const row of itemRows) {
    const existing = itemsByOrderId.get(row.orderId) ?? [];

    existing.push(mapOrderItemRow(row));

    itemsByOrderId.set(row.orderId, existing);
  }

  return orderRows.map((row) =>
    mapOrderRow(row, itemsByOrderId.get(row.id) ?? []),
  );
}

async function findById(orderId: string): Promise<Order | null> {
  const db = getDatabase();

  const [orderRow] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!orderRow) {
    return null;
  }

  const itemRows = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));

  return mapOrderRow(orderRow, itemRows.map(mapOrderItemRow));
}

async function findByIdInTransaction(
  transaction: DatabaseTransaction,
  orderId: string,
): Promise<Order | null> {
  const [orderRow] = await transaction
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!orderRow) {
    return null;
  }

  const itemRows = await transaction
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));

  return mapOrderRow(orderRow, itemRows.map(mapOrderItemRow));
}

async function findBySourceQuotationIdInTransaction(
  transaction: DatabaseTransaction,
  quotationId: string,
): Promise<Order | null> {
  const [orderRow] = await transaction
    .select()
    .from(orders)
    .where(eq(orders.sourceQuotationId, quotationId))
    .limit(1);

  if (!orderRow) {
    return null;
  }

  const itemRows = await transaction
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderRow.id));

  return mapOrderRow(orderRow, itemRows.map(mapOrderItemRow));
}

async function allocateIdentityInTransaction(
  transaction: DatabaseTransaction,
  itemCount: number,
): Promise<OrderIdentity> {
  await transaction.execute(
    sql`
      SELECT pg_advisory_xact_lock(
        hashtext('commerce:order-identity')
      )
    `,
  );

  const year = new Date().getUTCFullYear();

  const [latestOrder] = await transaction
    .select({
      id: orders.id,
    })
    .from(orders)
    .where(like(orders.id, `ORD-${year}-%`))
    .orderBy(desc(orders.id))
    .limit(1);

  const [latestItem] = await transaction
    .select({
      id: orderItems.id,
    })
    .from(orderItems)
    .orderBy(desc(orderItems.id))
    .limit(1);

  const orderSequence = getSequenceNumber(latestOrder?.id) + 1;

  const firstItemSequence = getSequenceNumber(latestItem?.id) + 1;

  const orderId = `ORD-${year}-${String(orderSequence).padStart(4, "0")}`;

  const itemIds = Array.from(
    {
      length: itemCount,
    },
    (_, index) =>
      `ORDER-ITEM-${String(firstItemSequence + index).padStart(3, "0")}`,
  );

  return {
    orderId,
    itemIds,
  };
}

async function insertInTransaction(
  transaction: DatabaseTransaction,
  order: Order,
) {
  await transaction.insert(orders).values({
    id: order.id,
    sourceQuotationId: order.sourceQuotationId,
    customerId: order.customerId,
    customerName: order.customerName,
    subtotal: order.subtotal,
    discount: order.discount,
    total: order.total,
    currency: order.currency,
    status: order.status,
    createdAt: new Date(order.createdAt),
    updatedAt: new Date(order.updatedAt),
  });

  if (order.items.length > 0) {
    await transaction.insert(orderItems).values(
      order.items.map((item) => ({
        id: item.id,
        orderId: order.id,
        sku: item.sku,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: item.lineTotal,
      })),
    );
  }
}

async function updateStatusInTransaction(
  transaction: DatabaseTransaction,
  orderId: string,
  expectedStatuses: OrderStatus[],
  nextStatus: OrderStatus,
  updatedAt: string,
): Promise<boolean> {
  if (expectedStatuses.length === 0) {
    return false;
  }

  const result = await transaction
    .update(orders)
    .set({
      status: nextStatus,
      updatedAt: new Date(updatedAt),
    })
    .where(
      and(eq(orders.id, orderId), inArray(orders.status, expectedStatuses)),
    )
    .returning({
      id: orders.id,
    });

  return result.length > 0;
}

async function updateStatus(
  orderId: string,
  expectedStatuses: OrderStatus[],
  nextStatus: OrderStatus,
  updatedAt: string,
): Promise<boolean> {
  const db = getDatabase();

  if (expectedStatuses.length === 0) {
    return false;
  }

  const result = await db
    .update(orders)
    .set({
      status: nextStatus,
      updatedAt: new Date(updatedAt),
    })
    .where(
      and(eq(orders.id, orderId), inArray(orders.status, expectedStatuses)),
    )
    .returning({
      id: orders.id,
    });

  return result.length > 0;
}

export const OrderRepository = {
  list,
  findById,
  findByIdInTransaction,
  findBySourceQuotationIdInTransaction,
  allocateIdentityInTransaction,
  insertInTransaction,
  updateStatusInTransaction,
  updateStatus,
};
