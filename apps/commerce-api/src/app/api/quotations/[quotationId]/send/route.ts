import { NextResponse } from "next/server";

import { createApiErrorResponse } from "@/lib/api-error";
import { sendQuotation } from "@/lib/quotations";

type RouteContext = {
  params: Promise<{
    quotationId: string;
  }>;
};

export async function POST(_request: Request, context: RouteContext) {
  try {
    const { quotationId } = await context.params;

    return NextResponse.json({
      data: sendQuotation(quotationId),
    });
  } catch (error) {
    return createApiErrorResponse(error);
  }
}
