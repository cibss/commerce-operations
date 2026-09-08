import { NextResponse } from "next/server";

import { createApiErrorResponse } from "@/lib/api-error";
import { CustomerRepository } from "@/repositories/CustomerRepository";

type RouteContext = {
  params: Promise<{
    customerId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { customerId } = await context.params;

    const customer = await CustomerRepository.getById(customerId);

    return NextResponse.json({
      data: customer,
    });
  } catch (error) {
    return createApiErrorResponse(error);
  }
}
