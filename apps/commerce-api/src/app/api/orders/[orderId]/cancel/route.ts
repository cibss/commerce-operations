import { NextResponse } from "next/server";

import { cancelOrder } from "@/lib/orders";
import { createApiErrorResponse } from "@/lib/api-error";

type RouteContext = {
  params: Promise<{
    orderId: string;
  }>;
};

export async function POST(_request: Request, context: RouteContext) {
  try {
    const { orderId } = await context.params;

    return NextResponse.json({
      data: cancelOrder(orderId),
    });
  } catch (error) {
    return createApiErrorResponse(error);
  }
}
