import { NextResponse } from "next/server";

import { createApiErrorResponse } from "@/lib/api-error";
import { PaymentService } from "@/services/PaymentService";

type RouteContext = {
  params: Promise<{
    orderId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { orderId } = await context.params;

    const payment = await PaymentService.findByOrderId(orderId);

    return NextResponse.json({
      data: payment,
    });
  } catch (error) {
    return createApiErrorResponse(error);
  }
}
