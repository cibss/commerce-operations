import { NextResponse } from "next/server";

import { QuotationDomainError } from "@/lib/quotations";

export function createApiErrorResponse(error: unknown) {
  if (error instanceof QuotationDomainError) {
    return NextResponse.json(
      {
        error: {
          message: error.message,
        },
      },
      {
        status: error.statusCode,
      },
    );
  }

  if (error instanceof SyntaxError) {
    return NextResponse.json(
      {
        error: {
          message: "Request body contains invalid JSON.",
        },
      },
      {
        status: 400,
      },
    );
  }

  console.error(error);

  return NextResponse.json(
    {
      error: {
        message: "An unexpected server error occurred.",
      },
    },
    {
      status: 500,
    },
  );
}
