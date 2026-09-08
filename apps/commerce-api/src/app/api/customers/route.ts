import { NextResponse } from "next/server";

import { CustomerRepository } from "@/repositories/CustomerRepository";

export async function GET() {
  const customerList = await CustomerRepository.list();

  return NextResponse.json({
    data: customerList,
  });
}
