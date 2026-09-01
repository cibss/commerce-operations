import type { Payment } from "@/lib/payment";

type ApiSuccess<T> = {
  data: T;
};

type ApiFailure = {
  error?: {
    message?: string;
  };
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

export function getPayments() {
  return request<Payment[]>("/api/payments");
}

export async function getPayment(paymentId: string) {
  try {
    return await request<Payment>(`/api/payments/${paymentId}`);
  } catch (error) {
    if (error instanceof CommerceApiError && error.statusCode === 404) {
      return null;
    }

    throw error;
  }
}

export function markPaymentPaid(paymentId: string) {
  return request<Payment>(`/api/payments/${paymentId}/pay`, {
    method: "POST",
  });
}

export function markPaymentFailed(paymentId: string) {
  return request<Payment>(`/api/payments/${paymentId}/fail`, {
    method: "POST",
  });
}

export function refundPayment(paymentId: string) {
  return request<Payment>(`/api/payments/${paymentId}/refund`, {
    method: "POST",
  });
}
