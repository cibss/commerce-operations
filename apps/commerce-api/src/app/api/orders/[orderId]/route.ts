import { NextResponse } from "next/server";

import { createApiErrorResponse } from "@/lib/api-error";
import { getOrder } from "@/lib/orders";

type RouteContext = {
  params: Promise<{
    orderId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { orderId } = await context.params;

    return NextResponse.json({
      data: getOrder(orderId),
    });
  } catch (error) {
    return createApiErrorResponse(error);
  }
}
