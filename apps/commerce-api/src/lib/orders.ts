export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "COMPLETED"
  | "CANCELLED";

export type Currency = "IDR";

export type OrderItem = {
  id: string;
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type Order = {
  id: string;
  sourceQuotationId: string | null;
  customerId: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  currency: Currency;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
};

export class OrderDomainError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);

    this.name = "OrderDomainError";
    this.statusCode = statusCode;
  }
}

const seedOrders: Order[] = [
  {
    id: "ORD-2026-0181",
    sourceQuotationId: "QT-2026-0039",
    customerId: "CUST-0175",
    customerName: "PT Meridian Digital",
    items: [
      {
        id: "ORDER-ITEM-001",
        sku: "LAPTOP-BIZ-01",
        name: "Business Laptop",
        quantity: 12,
        unitPrice: 14_000_000,
        lineTotal: 168_000_000,
      },
    ],
    subtotal: 168_000_000,
    discount: 8_000_000,
    total: 160_000_000,
    currency: "IDR",
    status: "PENDING",
    createdAt: "2026-08-27T03:00:00.000Z",
    updatedAt: "2026-08-27T03:00:00.000Z",
  },
  {
    id: "ORD-2026-0180",
    sourceQuotationId: "QT-2026-0038",
    customerId: "CUST-0168",
    customerName: "PT Atlas Retail Indonesia",
    items: [
      {
        id: "ORDER-ITEM-002",
        sku: "MON-4K-27",
        name: "27-inch 4K Monitor",
        quantity: 20,
        unitPrice: 6_500_000,
        lineTotal: 130_000_000,
      },
      {
        id: "ORDER-ITEM-003",
        sku: "DOCK-USBC",
        name: "USB-C Dock",
        quantity: 20,
        unitPrice: 2_000_000,
        lineTotal: 40_000_000,
      },
    ],
    subtotal: 170_000_000,
    discount: 5_000_000,
    total: 165_000_000,
    currency: "IDR",
    status: "PROCESSING",
    createdAt: "2026-08-25T04:30:00.000Z",
    updatedAt: "2026-08-28T07:00:00.000Z",
  },
  {
    id: "ORD-2026-0179",
    sourceQuotationId: "QT-2026-0037",
    customerId: "CUST-0152",
    customerName: "PT Garuda Solusi",
    items: [
      {
        id: "ORDER-ITEM-004",
        sku: "MBP-M4-14",
        name: "MacBook Pro 14 M4",
        quantity: 5,
        unitPrice: 30_000_000,
        lineTotal: 150_000_000,
      },
    ],
    subtotal: 150_000_000,
    discount: 0,
    total: 150_000_000,
    currency: "IDR",
    status: "SHIPPED",
    createdAt: "2026-08-22T02:15:00.000Z",
    updatedAt: "2026-08-29T05:45:00.000Z",
  },
];

const orders = new Map<string, Order>(
  seedOrders.map((order) => [order.id, order]),
);

function cloneOrder(order: Order): Order {
  return structuredClone(order);
}

function getOrderOrThrow(id: string): Order {
  const order = orders.get(id);

  if (!order) {
    throw new OrderDomainError(`Order ${id} was not found.`, 404);
  }

  return order;
}

function transitionOrder(
  id: string,
  allowedFrom: OrderStatus[],
  to: OrderStatus,
): Order {
  const order = getOrderOrThrow(id);

  if (!allowedFrom.includes(order.status)) {
    throw new OrderDomainError(
      `Order ${id} cannot transition from ${order.status} to ${to}.`,
      409,
    );
  }

  const updatedOrder: Order = {
    ...order,
    status: to,
    updatedAt: new Date().toISOString(),
  };

  orders.set(id, updatedOrder);

  return cloneOrder(updatedOrder);
}

export function listOrders(): Order[] {
  return Array.from(orders.values())
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(cloneOrder);
}

export function getOrder(id: string): Order {
  return cloneOrder(getOrderOrThrow(id));
}

export function confirmOrder(id: string): Order {
  return transitionOrder(id, ["PENDING"], "CONFIRMED");
}

export function processOrder(id: string): Order {
  return transitionOrder(id, ["CONFIRMED"], "PROCESSING");
}

export function shipOrder(id: string): Order {
  return transitionOrder(id, ["PROCESSING"], "SHIPPED");
}

export function completeOrder(id: string): Order {
  return transitionOrder(id, ["SHIPPED"], "COMPLETED");
}

export function cancelOrder(id: string): Order {
  return transitionOrder(id, ["PENDING", "CONFIRMED"], "CANCELLED");
}
