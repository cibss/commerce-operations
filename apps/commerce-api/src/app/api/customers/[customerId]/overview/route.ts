import { NextResponse } from "next/server";

import { createApiErrorResponse } from "@/lib/api-error";
import { getCustomerOverview } from "@/lib/customer-overview";

type RouteContext = {
  params: Promise<{
    customerId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { customerId } = await context.params;

    const overview = await getCustomerOverview(customerId);

    return NextResponse.json({
      data: overview,
    });
  } catch (error) {
    return createApiErrorResponse(error);
  }
}
