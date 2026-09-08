import { getDatabase } from "@/db/client";
import type { DatabaseTransaction } from "@/db/types";
import {
  assertOrderTransition,
  type CreateOrderFromQuotationInput,
  type Order,
  OrderDomainError,
  type OrderItem,
  type OrderStatus,
} from "@/lib/orders";
import { OrderRepository } from "@/repositories/OrderRepository";

async function list(): Promise<Order[]> {
  return OrderRepository.list();
}

async function getById(orderId: string): Promise<Order> {
  const order = await OrderRepository.findById(orderId);

  if (!order) {
    throw new OrderDomainError(`Order ${orderId} was not found.`, 404);
  }

  return order;
}

export async function createOrderFromQuotationInTransaction(
  transaction: DatabaseTransaction,
  input: CreateOrderFromQuotationInput,
): Promise<Order> {
  const existingOrder =
    await OrderRepository.findBySourceQuotationIdInTransaction(
      transaction,
      input.sourceQuotationId,
    );

  if (existingOrder) {
    return existingOrder;
  }

  const identity = await OrderRepository.allocateIdentityInTransaction(
    transaction,
    input.items.length,
  );

  const timestamp = new Date().toISOString();

  const items: OrderItem[] = input.items.map((item, index) => ({
    id: identity.itemIds[index],

    sku: item.sku,
    name: item.name,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    lineTotal: item.lineTotal,
  }));

  const order: Order = {
    id: identity.orderId,

    sourceQuotationId: input.sourceQuotationId,

    customerId: input.customerId,

    customerName: input.customerName,

    items,

    subtotal: input.subtotal,

    discount: input.discount,

    total: input.total,

    currency: input.currency,

    status: "PENDING",

    createdAt: timestamp,
    updatedAt: timestamp,
  };

  await OrderRepository.insertInTransaction(transaction, order);

  return order;
}

async function createFromQuotation(
  input: CreateOrderFromQuotationInput,
): Promise<Order> {
  const db = getDatabase();

  return db.transaction(async (transaction) =>
    createOrderFromQuotationInTransaction(transaction, input),
  );
}

async function transition(
  orderId: string,
  expectedStatuses: OrderStatus[],
  nextStatus: OrderStatus,
): Promise<Order> {
  const updated = await OrderRepository.updateStatus(
    orderId,
    expectedStatuses,
    nextStatus,
    new Date().toISOString(),
  );

  if (!updated) {
    const current = await OrderRepository.findById(orderId);

    if (!current) {
      throw new OrderDomainError(`Order ${orderId} was not found.`, 404);
    }

    assertOrderTransition(
      orderId,
      current.status,
      expectedStatuses,
      nextStatus,
    );

    throw new OrderDomainError(`Order ${orderId} could not be updated.`, 409);
  }

  return getById(orderId);
}

async function confirm(orderId: string) {
  return transition(orderId, ["PENDING"], "CONFIRMED");
}

async function process(orderId: string) {
  return transition(orderId, ["CONFIRMED"], "PROCESSING");
}

async function ship(orderId: string) {
  return transition(orderId, ["PROCESSING"], "SHIPPED");
}

async function complete(orderId: string) {
  return transition(orderId, ["SHIPPED"], "COMPLETED");
}

async function cancel(orderId: string) {
  return transition(orderId, ["PENDING", "CONFIRMED"], "CANCELLED");
}

export const OrderService = {
  list,
  getById,
  createFromQuotation,
  confirm,
  process,
  ship,
  complete,
  cancel,
};
