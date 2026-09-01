import { NextResponse } from "next/server";

import { createApiErrorResponse } from "@/lib/api-error";
import { markPaymentFailed } from "@/lib/payments";

type RouteContext = {
  params: Promise<{
    paymentId: string;
  }>;
};

export async function POST(_request: Request, context: RouteContext) {
  try {
    const { paymentId } = await context.params;

    return NextResponse.json({
      data: markPaymentFailed(paymentId),
    });
  } catch (error) {
    return createApiErrorResponse(error);
  }
}
