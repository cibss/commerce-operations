import { NextResponse } from "next/server";

import { createApiErrorResponse } from "@/lib/api-error";
import { OrderService } from "@/services/OrderService";

export async function GET() {
  try {
    const orders = await OrderService.list();

    return NextResponse.json({
      data: orders,
    });
  } catch (error) {
    return createApiErrorResponse(error);
  }
}
