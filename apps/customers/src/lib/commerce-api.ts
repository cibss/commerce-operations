import type { Customer, CustomerOverview } from "@/lib/customer";

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

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${getCommerceApiOrigin()}${path}`, {
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

export function getCustomers() {
  return request<Customer[]>("/api/customers");
}

export async function getCustomerOverview(customerId: string) {
  try {
    return await request<CustomerOverview>(
      `/api/customers/${customerId}/overview`,
    );
  } catch (error) {
    if (error instanceof CommerceApiError && error.statusCode === 404) {
      return null;
    }

    throw error;
  }
}
