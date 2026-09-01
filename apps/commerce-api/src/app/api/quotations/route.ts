import { NextResponse } from "next/server";

import { createApiErrorResponse } from "@/lib/api-error";
import {
  createQuotationForCustomer,
  type CreateQuotationForCustomerInput,
} from "@/lib/create-quotation";
import { listQuotations } from "@/lib/quotations";

export async function GET() {
  return NextResponse.json({
    data: listQuotations(),
  });
}

export async function POST(request: Request) {
  try {
    const input = (await request.json()) as CreateQuotationForCustomerInput;

    const quotation = createQuotationForCustomer(input);

    return NextResponse.json(
      {
        data: quotation,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    return createApiErrorResponse(error);
  }
}
