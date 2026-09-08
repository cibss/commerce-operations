import { and, desc, eq, inArray, like, sql } from "drizzle-orm";

import { getDatabase } from "@/db/client";
import { quotationItems, quotations } from "@/db/schema";
import type { DatabaseTransaction } from "@/db/types";
import type {
  Currency,
  Quotation,
  QuotationItem,
  QuotationStatus,
} from "@/lib/quotations";

type QuotationRow = typeof quotations.$inferSelect;

type QuotationItemRow = typeof quotationItems.$inferSelect;

export type QuotationIdentity = {
  quotationId: string;
  itemIds: string[];
};

function mapQuotationItemRow(row: QuotationItemRow): QuotationItem {
  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
    quantity: row.quantity,
    unitPrice: row.unitPrice,
    lineTotal: row.lineTotal,
  };
}

function mapQuotationRow(row: QuotationRow, items: QuotationItem[]): Quotation {
  return {
    id: row.id,
    customerId: row.customerId,
    customerName: row.customerName,
    items,
    subtotal: row.subtotal,
    discount: row.discount,
    total: row.total,
    currency: row.currency as Currency,
    status: row.status as QuotationStatus,
    convertedOrderId: row.convertedOrderId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function getSequenceNumber(id: string | undefined) {
  if (!id) {
    return 0;
  }

  const value = id.split("-").at(-1);

  const sequence = Number(value);

  return Number.isInteger(sequence) ? sequence : 0;
}

async function list(): Promise<Quotation[]> {
  const db = getDatabase();

  const quotationRows = await db
    .select()
    .from(quotations)
    .orderBy(desc(quotations.createdAt));

  if (quotationRows.length === 0) {
    return [];
  }

  const quotationIds = quotationRows.map((quotation) => quotation.id);

  const itemRows = await db
    .select()
    .from(quotationItems)
    .where(inArray(quotationItems.quotationId, quotationIds));

  const itemsByQuotationId = new Map<string, QuotationItem[]>();

  for (const row of itemRows) {
    const existing = itemsByQuotationId.get(row.quotationId) ?? [];

    existing.push(mapQuotationItemRow(row));

    itemsByQuotationId.set(row.quotationId, existing);
  }

  return quotationRows.map((row) =>
    mapQuotationRow(row, itemsByQuotationId.get(row.id) ?? []),
  );
}

async function findById(quotationId: string): Promise<Quotation | null> {
  const db = getDatabase();

  const [quotationRow] = await db
    .select()
    .from(quotations)
    .where(eq(quotations.id, quotationId))
    .limit(1);

  if (!quotationRow) {
    return null;
  }

  const itemRows = await db
    .select()
    .from(quotationItems)
    .where(eq(quotationItems.quotationId, quotationId));

  return mapQuotationRow(quotationRow, itemRows.map(mapQuotationItemRow));
}

async function findByIdInTransaction(
  transaction: DatabaseTransaction,
  quotationId: string,
): Promise<Quotation | null> {
  const [quotationRow] = await transaction
    .select()
    .from(quotations)
    .where(eq(quotations.id, quotationId))
    .limit(1);

  if (!quotationRow) {
    return null;
  }

  const itemRows = await transaction
    .select()
    .from(quotationItems)
    .where(eq(quotationItems.quotationId, quotationId));

  return mapQuotationRow(quotationRow, itemRows.map(mapQuotationItemRow));
}

async function lockByIdInTransaction(
  transaction: DatabaseTransaction,
  quotationId: string,
) {
  await transaction.execute(
    sql`
      SELECT id
      FROM ${quotations}
      WHERE ${quotations.id} = ${quotationId}
      FOR UPDATE
    `,
  );
}

async function allocateIdentityInTransaction(
  transaction: DatabaseTransaction,
  itemCount: number,
): Promise<QuotationIdentity> {
  /*
   * Serialize quotation ID allocation.
   *
   * Without this, two concurrent requests could
   * both read QT-2026-0042 and attempt to create
   * QT-2026-0043.
   */
  await transaction.execute(
    sql`
      SELECT pg_advisory_xact_lock(
        hashtext('commerce:quotation-identity')
      )
    `,
  );

  const year = new Date().getUTCFullYear();

  const [latestQuotation] = await transaction
    .select({
      id: quotations.id,
    })
    .from(quotations)
    .where(like(quotations.id, `QT-${year}-%`))
    .orderBy(desc(quotations.id))
    .limit(1);

  const [latestItem] = await transaction
    .select({
      id: quotationItems.id,
    })
    .from(quotationItems)
    .orderBy(desc(quotationItems.id))
    .limit(1);

  const quotationSequence = getSequenceNumber(latestQuotation?.id) + 1;

  const firstItemSequence = getSequenceNumber(latestItem?.id) + 1;

  const quotationId = `QT-${year}-${String(quotationSequence).padStart(
    4,
    "0",
  )}`;

  const itemIds = Array.from(
    {
      length: itemCount,
    },
    (_, index) => `ITEM-${String(firstItemSequence + index).padStart(3, "0")}`,
  );

  return {
    quotationId,
    itemIds,
  };
}

async function insertInTransaction(
  transaction: DatabaseTransaction,
  quotation: Quotation,
) {
  await transaction.insert(quotations).values({
    id: quotation.id,
    customerId: quotation.customerId,
    customerName: quotation.customerName,
    subtotal: quotation.subtotal,
    discount: quotation.discount,
    total: quotation.total,
    currency: quotation.currency,
    status: quotation.status,
    convertedOrderId: quotation.convertedOrderId,
    createdAt: new Date(quotation.createdAt),
    updatedAt: new Date(quotation.updatedAt),
  });

  if (quotation.items.length > 0) {
    await transaction.insert(quotationItems).values(
      quotation.items.map((item) => ({
        id: item.id,
        quotationId: quotation.id,
        sku: item.sku,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: item.lineTotal,
      })),
    );
  }
}

async function updateStatus(
  quotationId: string,
  expectedStatus: QuotationStatus,
  nextStatus: QuotationStatus,
  updatedAt: string,
): Promise<boolean> {
  const db = getDatabase();

  const result = await db
    .update(quotations)
    .set({
      status: nextStatus,
      updatedAt: new Date(updatedAt),
    })
    .where(
      and(
        eq(quotations.id, quotationId),
        eq(quotations.status, expectedStatus),
      ),
    )
    .returning({
      id: quotations.id,
    });

  return result.length > 0;
}

async function markConvertedInTransaction(
  transaction: DatabaseTransaction,
  quotationId: string,
  orderId: string,
  updatedAt: string,
): Promise<boolean> {
  const result = await transaction
    .update(quotations)
    .set({
      status: "CONVERTED",
      convertedOrderId: orderId,
      updatedAt: new Date(updatedAt),
    })
    .where(
      and(eq(quotations.id, quotationId), eq(quotations.status, "ACCEPTED")),
    )
    .returning({
      id: quotations.id,
    });

  return result.length > 0;
}

export const QuotationRepository = {
  list,
  findById,
  findByIdInTransaction,
  lockByIdInTransaction,
  allocateIdentityInTransaction,
  insertInTransaction,
  updateStatus,
  markConvertedInTransaction,
};
