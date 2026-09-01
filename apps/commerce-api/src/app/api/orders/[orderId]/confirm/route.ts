import { NextResponse } from "next/server";

import { createApiErrorResponse } from "@/lib/api-error";
import { confirmOrder } from "@/lib/orders";

type RouteContext = {
  params: Promise<{
    orderId: string;
  }>;
};

export async function POST(_request: Request, context: RouteContext) {
  try {
    const { orderId } = await context.params;

    return NextResponse.json({
      data: confirmOrder(orderId),
    });
  } catch (error) {
    return createApiErrorResponse(error);
  }
}
