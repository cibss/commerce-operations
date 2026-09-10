import type { Order, OrderPayment } from "@/lib/order";

type ApiSuccess<T> = {
  data: T;
};

type ApiFailure = {
  error?: {
    message?: string;
  };
};

export type ConfirmOrderResult = {
  order: Order;
  paymentId: string;
};

export class CommerceApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);

    this.name = "CommerceApiError";
    this.statusCode = statusCode;
  }
}

function getCommerceApiOrigin() {
  const origin = process.env.COMMERCE_API_ORIGIN;

  if (!origin) {
    throw new Error("Missing COMMERCE_API_ORIGIN environment variable.");
  }

  return origin.replace(/\/$/, "");
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getCommerceApiOrigin()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ApiFailure | null;

    throw new CommerceApiError(
      body?.error?.message ??
        `Commerce API request failed with status ${response.status}.`,
      response.status,
    );
  }

  const body = (await response.json()) as ApiSuccess<T>;

  return body.data;
}

export function getOrders() {
  return request<Order[]>("/api/orders");
}

export async function getOrder(orderId: string) {
  try {
    return await request<Order>(`/api/orders/${orderId}`);
  } catch (error) {
    if (error instanceof CommerceApiError && error.statusCode === 404) {
      return null;
    }

    throw error;
  }
}

export function getOrderPayment(orderId: string) {
  return request<OrderPayment | null>(`/api/payments/by-order/${orderId}`);
}

export function confirmOrder(orderId: string) {
  return request<ConfirmOrderResult>(`/api/orders/${orderId}/confirm`, {
    method: "POST",
  });
}

export function processOrder(orderId: string) {
  return request<Order>(`/api/orders/${orderId}/process`, {
    method: "POST",
  });
}

export function shipOrder(orderId: string) {
  return request<Order>(`/api/orders/${orderId}/ship`, {
    method: "POST",
  });
}

export function completeOrder(orderId: string) {
  return request<Order>(`/api/orders/${orderId}/complete`, {
    method: "POST",
  });
}

export function cancelOrder(orderId: string) {
  return request<Order>(`/api/orders/${orderId}/cancel`, {
    method: "POST",
  });
}
