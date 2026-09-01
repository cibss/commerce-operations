import { NextResponse } from "next/server";

import { createApiErrorResponse } from "@/lib/api-error";
import { getPayment } from "@/lib/payments";

type RouteContext = {
  params: Promise<{
    paymentId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { paymentId } = await context.params;

    return NextResponse.json({
      data: getPayment(paymentId),
    });
  } catch (error) {
    return createApiErrorResponse(error);
  }
}
