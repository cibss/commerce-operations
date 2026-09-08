import { NextResponse } from "next/server";

import { createApiErrorResponse } from "@/lib/api-error";
import {
  createQuotationForCustomer,
  type CreateQuotationForCustomerInput,
} from "@/lib/create-quotation";
import { QuotationService } from "@/services/QuotationService";

export async function GET() {
  try {
    const quotations = await QuotationService.list();

    return NextResponse.json({
      data: quotations,
    });
  } catch (error) {
    return createApiErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const input = (await request.json()) as CreateQuotationForCustomerInput;

    const quotation = await createQuotationForCustomer(input);

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
