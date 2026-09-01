import type { CreateQuotationInput, Quotation } from "@/lib/quotation";

type ApiSuccess<T> = {
  data: T;
};

type ApiFailure = {
  error?: {
    message?: string;
  };
};

export type ConvertQuotationResult = {
  quotationId: string;
  orderId: string;
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

export function getQuotations() {
  return request<Quotation[]>("/api/quotations");
}

export async function getQuotation(quotationId: string) {
  try {
    return await request<Quotation>(`/api/quotations/${quotationId}`);
  } catch (error) {
    if (error instanceof CommerceApiError && error.statusCode === 404) {
      return null;
    }

    throw error;
  }
}

export function createQuotation(input: CreateQuotationInput) {
  return request<Quotation>("/api/quotations", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function sendQuotation(quotationId: string) {
  return request<Quotation>(`/api/quotations/${quotationId}/send`, {
    method: "POST",
  });
}

export function acceptQuotation(quotationId: string) {
  return request<Quotation>(`/api/quotations/${quotationId}/accept`, {
    method: "POST",
  });
}

export function rejectQuotation(quotationId: string) {
  return request<Quotation>(`/api/quotations/${quotationId}/reject`, {
    method: "POST",
  });
}

export function convertQuotation(quotationId: string) {
  return request<ConvertQuotationResult>(
    `/api/quotations/${quotationId}/convert`,
    {
      method: "POST",
    },
  );
}
