import {
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const customers = pgTable("customers", {
  id: text("id").primaryKey(),

  companyName: text("company_name").notNull(),

  contactName: text("contact_name").notNull(),

  email: text("email").notNull(),

  phone: text("phone").notNull(),

  segment: text("segment").notNull(),

  status: text("status").notNull(),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),

  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
});

export const quotations = pgTable("quotations", {
  id: text("id").primaryKey(),

  customerId: text("customer_id")
    .notNull()
    .references(() => customers.id),

  customerName: text("customer_name").notNull(),

  subtotal: integer("subtotal").notNull(),

  discount: integer("discount").notNull(),

  total: integer("total").notNull(),

  currency: text("currency").notNull(),

  status: text("status").notNull(),

  convertedOrderId: text("converted_order_id"),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),

  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
});

export const quotationItems = pgTable("quotation_items", {
  id: text("id").primaryKey(),

  quotationId: text("quotation_id")
    .notNull()
    .references(() => quotations.id, {
      onDelete: "cascade",
    }),

  sku: text("sku").notNull(),

  name: text("name").notNull(),

  quantity: integer("quantity").notNull(),

  unitPrice: integer("unit_price").notNull(),

  lineTotal: integer("line_total").notNull(),
});

export const orders = pgTable(
  "orders",
  {
    id: text("id").primaryKey(),

    sourceQuotationId: text("source_quotation_id"),

    customerId: text("customer_id")
      .notNull()
      .references(() => customers.id),

    customerName: text("customer_name").notNull(),

    subtotal: integer("subtotal").notNull(),

    discount: integer("discount").notNull(),

    total: integer("total").notNull(),

    currency: text("currency").notNull(),

    status: text("status").notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("orders_source_quotation_unique").on(table.sourceQuotationId),
  ],
);

export const orderItems = pgTable("order_items", {
  id: text("id").primaryKey(),

  orderId: text("order_id")
    .notNull()
    .references(() => orders.id, {
      onDelete: "cascade",
    }),

  sku: text("sku").notNull(),

  name: text("name").notNull(),

  quantity: integer("quantity").notNull(),

  unitPrice: integer("unit_price").notNull(),

  lineTotal: integer("line_total").notNull(),
});

export const payments = pgTable(
  "payments",
  {
    id: text("id").primaryKey(),

    orderId: text("order_id")
      .notNull()
      .references(() => orders.id),

    amount: integer("amount").notNull(),

    currency: text("currency").notNull(),

    method: text("method").notNull(),

    status: text("status").notNull(),

    reference: text("reference").notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),

    paidAt: timestamp("paid_at", {
      withTimezone: true,
    }),

    refundedAt: timestamp("refunded_at", {
      withTimezone: true,
    }),
  },
  (table) => [uniqueIndex("payments_order_unique").on(table.orderId)],
);
