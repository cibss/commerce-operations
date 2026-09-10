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
import { PaymentService } from "@/services/PaymentService";

export type ConfirmOrderResult = {
  order: Order;
  paymentId: string;
};

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

async function confirm(orderId: string): Promise<ConfirmOrderResult> {
  const db = getDatabase();

  return db.transaction(async (transaction) => {
    const updated = await OrderRepository.updateStatusInTransaction(
      transaction,
      orderId,
      ["PENDING"],
      "CONFIRMED",
      new Date().toISOString(),
    );

    if (!updated) {
      const current = await OrderRepository.findByIdInTransaction(
        transaction,
        orderId,
      );

      if (!current) {
        throw new OrderDomainError(`Order ${orderId} was not found.`, 404);
      }

      assertOrderTransition(orderId, current.status, ["PENDING"], "CONFIRMED");

      throw new OrderDomainError(
        `Order ${orderId} could not be confirmed.`,
        409,
      );
    }

    const confirmedOrder = await OrderRepository.findByIdInTransaction(
      transaction,
      orderId,
    );

    if (!confirmedOrder) {
      throw new OrderDomainError(
        `Order ${orderId} could not be loaded after confirmation.`,
        409,
      );
    }

    const payment = await PaymentService.ensureForOrderInTransaction(
      transaction,
      {
        orderId: confirmedOrder.id,
        amount: confirmedOrder.total,
        currency: confirmedOrder.currency,
      },
    );

    return {
      order: confirmedOrder,
      paymentId: payment.id,
    };
  });
}

async function process(orderId: string): Promise<Order> {
  const order = await getById(orderId);

  assertOrderTransition(orderId, order.status, ["CONFIRMED"], "PROCESSING");

  const payment = await PaymentService.findByOrderId(orderId);

  if (!payment) {
    throw new OrderDomainError(
      `Order ${orderId} cannot start processing because its payment record was not found.`,
      409,
    );
  }

  if (payment.status !== "PAID") {
    throw new OrderDomainError(
      `Order ${orderId} cannot start processing until payment is PAID. Current payment status: ${payment.status}.`,
      409,
    );
  }

  return transition(orderId, ["CONFIRMED"], "PROCESSING");
}

async function ship(orderId: string) {
  return transition(orderId, ["PROCESSING"], "SHIPPED");
}

async function complete(orderId: string) {
  return transition(orderId, ["SHIPPED"], "COMPLETED");
}

async function cancel(orderId: string): Promise<Order> {
  const db = getDatabase();

  return db.transaction(async (transaction) => {
    const currentOrder = await OrderRepository.findByIdInTransaction(
      transaction,
      orderId,
    );

    if (!currentOrder) {
      throw new OrderDomainError(`Order ${orderId} was not found.`, 404);
    }

    assertOrderTransition(
      orderId,
      currentOrder.status,
      ["PENDING", "CONFIRMED"],
      "CANCELLED",
    );

    const payment = await PaymentService.handleOrderCancellationInTransaction(
      transaction,
      orderId,
    );

    if (currentOrder.status === "CONFIRMED" && !payment) {
      throw new OrderDomainError(
        `Confirmed order ${orderId} cannot be cancelled because its payment record was not found.`,
        409,
      );
    }

    const updated = await OrderRepository.updateStatusInTransaction(
      transaction,
      orderId,
      [currentOrder.status],
      "CANCELLED",
      new Date().toISOString(),
    );

    if (!updated) {
      const latestOrder = await OrderRepository.findByIdInTransaction(
        transaction,
        orderId,
      );

      if (!latestOrder) {
        throw new OrderDomainError(`Order ${orderId} was not found.`, 404);
      }

      assertOrderTransition(
        orderId,
        latestOrder.status,
        ["PENDING", "CONFIRMED"],
        "CANCELLED",
      );

      throw new OrderDomainError(
        `Order ${orderId} could not be cancelled.`,
        409,
      );
    }

    const cancelledOrder = await OrderRepository.findByIdInTransaction(
      transaction,
      orderId,
    );

    if (!cancelledOrder) {
      throw new OrderDomainError(
        `Order ${orderId} could not be loaded after cancellation.`,
        409,
      );
    }

    return cancelledOrder;
  });
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
