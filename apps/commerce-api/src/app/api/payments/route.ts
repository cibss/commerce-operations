import { NextResponse } from "next/server";

import { listPayments } from "@/lib/payments";

export async function GET() {
  return NextResponse.json({
    data: listPayments(),
  });
}
