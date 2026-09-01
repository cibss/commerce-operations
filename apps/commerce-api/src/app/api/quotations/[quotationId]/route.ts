import { NextResponse } from "next/server";

import { createApiErrorResponse } from "@/lib/api-error";
import { getQuotation } from "@/lib/quotations";

type RouteContext = {
  params: Promise<{
    quotationId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { quotationId } = await context.params;

    return NextResponse.json({
      data: getQuotation(quotationId),
    });
  } catch (error) {
    return createApiErrorResponse(error);
  }
}
