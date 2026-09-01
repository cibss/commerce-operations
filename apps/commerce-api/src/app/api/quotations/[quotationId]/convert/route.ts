import { NextResponse } from "next/server";

import { createApiErrorResponse } from "@/lib/api-error";
import { convertQuotationToOrder } from "@/lib/quotation-order-conversion";

type RouteContext = {
  params: Promise<{
    quotationId: string;
  }>;
};

export async function POST(_request: Request, context: RouteContext) {
  try {
    const { quotationId } = await context.params;

    const result = convertQuotationToOrder(quotationId);

    return NextResponse.json({
      data: result,
    });
  } catch (error) {
    return createApiErrorResponse(error);
  }
}
