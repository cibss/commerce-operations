import { NextResponse } from "next/server";

import { createApiErrorResponse } from "@/lib/api-error";
import { OrderService } from "@/services/OrderService";

type RouteContext = {
  params: Promise<{
    orderId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { orderId } = await context.params;

    const order = await OrderService.getById(orderId);

    return NextResponse.json({
      data: order,
    });
  } catch (error) {
    return createApiErrorResponse(error);
  }
}
