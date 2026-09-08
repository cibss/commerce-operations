import { NextResponse } from "next/server";

import { createApiErrorResponse } from "@/lib/api-error";
import { PaymentService } from "@/services/PaymentService";

export async function GET() {
  try {
    const payments = await PaymentService.list();

    return NextResponse.json({
      data: payments,
    });
  } catch (error) {
    return createApiErrorResponse(error);
  }
}
