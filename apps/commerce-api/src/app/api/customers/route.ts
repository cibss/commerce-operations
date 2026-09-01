import { NextResponse } from "next/server";

import { listCustomers } from "@/lib/customers";

export async function GET() {
  return NextResponse.json({
    data: listCustomers(),
  });
}
