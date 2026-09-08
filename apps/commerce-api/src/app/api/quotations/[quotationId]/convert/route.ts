import { NextResponse } from "next/server";

import { createApiErrorResponse } from "@/lib/api-error";
import { QuotationOrderConversionService } from "@/services/QuotationOrderConversionService";

type RouteContext = {
  params: Promise<{
    quotationId: string;
  }>;
};

export async function POST(_request: Request, context: RouteContext) {
  try {
    const { quotationId } = await context.params;

    const result = await QuotationOrderConversionService.convert(quotationId);

    return NextResponse.json({
      data: result,
    });
  } catch (error) {
    return createApiErrorResponse(error);
  }
}
