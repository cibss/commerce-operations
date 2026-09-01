import { NextResponse } from "next/server";

import { createApiErrorResponse } from "@/lib/api-error";
import { getCustomer } from "@/lib/customers";

type RouteContext = {
  params: Promise<{
    customerId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { customerId } = await context.params;

    return NextResponse.json({
      data: getCustomer(customerId),
    });
  } catch (error) {
    return createApiErrorResponse(error);
  }
}
