import { asc, eq } from "drizzle-orm";

import { db } from "@/db/client";
import { customers } from "@/db/schema";
import {
  CustomerDomainError,
  type Customer,
  type CustomerSegment,
  type CustomerStatus,
} from "@/lib/customers";

type CustomerRow = typeof customers.$inferSelect;

function mapCustomerRow(row: CustomerRow): Customer {
  return {
    id: row.id,
    companyName: row.companyName,
    contactName: row.contactName,
    email: row.email,
    phone: row.phone,
    segment: row.segment as CustomerSegment,
    status: row.status as CustomerStatus,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

async function list(): Promise<Customer[]> {
  const rows = await db
    .select()
    .from(customers)
    .orderBy(asc(customers.companyName));

  return rows.map(mapCustomerRow);
}

async function getById(customerId: string): Promise<Customer> {
  const [row] = await db
    .select()
    .from(customers)
    .where(eq(customers.id, customerId))
    .limit(1);

  if (!row) {
    throw new CustomerDomainError(`Customer ${customerId} was not found.`, 404);
  }

  return mapCustomerRow(row);
}

export const CustomerRepository = {
  list,
  getById,
};
