import { NextResponse } from "next/server";

import { createApiErrorResponse } from "@/lib/api-error";
import { QuotationService } from "@/services/QuotationService";

type RouteContext = {
  params: Promise<{
    quotationId: string;
  }>;
};

export async function POST(_request: Request, context: RouteContext) {
  try {
    const { quotationId } = await context.params;

    const quotation = await QuotationService.reject(quotationId);

    return NextResponse.json({
      data: quotation,
    });
  } catch (error) {
    return createApiErrorResponse(error);
  }
}
