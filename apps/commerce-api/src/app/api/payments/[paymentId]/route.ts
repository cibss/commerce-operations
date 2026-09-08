import { NextResponse } from "next/server";

import { createApiErrorResponse } from "@/lib/api-error";
import { PaymentService } from "@/services/PaymentService";

type RouteContext = {
  params: Promise<{
    paymentId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { paymentId } = await context.params;

    const payment = await PaymentService.getById(paymentId);

    return NextResponse.json({
      data: payment,
    });
  } catch (error) {
    return createApiErrorResponse(error);
  }
}
