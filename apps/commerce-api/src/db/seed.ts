import { config } from "dotenv";

import {
  customers,
  orderItems,
  orders,
  payments,
  quotationItems,
  quotations,
} from "@/db/schema";

config({
  path: ".env.local",
});

const customerSeed = [
  {
    id: "CUST-0192",
    companyName: "PT Nusantara Teknologi",
    contactName: "Andi Pratama",
    email: "andi@nusantarateknologi.co.id",
    phone: "+62 21 555 0192",
    segment: "ENTERPRISE",
    status: "ACTIVE",
    createdAt: new Date("2026-01-14T03:00:00.000Z"),
    updatedAt: new Date("2026-08-20T04:30:00.000Z"),
  },
  {
    id: "CUST-0188",
    companyName: "PT Sinar Digital Indonesia",
    contactName: "Maya Putri",
    email: "maya@sinardigital.co.id",
    phone: "+62 21 555 0188",
    segment: "MID_MARKET",
    status: "ACTIVE",
    createdAt: new Date("2026-02-08T02:00:00.000Z"),
    updatedAt: new Date("2026-08-18T06:00:00.000Z"),
  },
  {
    id: "CUST-0179",
    companyName: "PT Aruna Commerce",
    contactName: "Dimas Santoso",
    email: "dimas@arunacommerce.co.id",
    phone: "+62 21 555 0179",
    segment: "MID_MARKET",
    status: "ACTIVE",
    createdAt: new Date("2026-03-11T05:00:00.000Z"),
    updatedAt: new Date("2026-08-14T01:30:00.000Z"),
  },
  {
    id: "CUST-0175",
    companyName: "PT Meridian Digital",
    contactName: "Nadia Wijaya",
    email: "nadia@meridiandigital.co.id",
    phone: "+62 21 555 0175",
    segment: "ENTERPRISE",
    status: "ACTIVE",
    createdAt: new Date("2026-03-20T02:30:00.000Z"),
    updatedAt: new Date("2026-08-15T03:00:00.000Z"),
  },
  {
    id: "CUST-0168",
    companyName: "PT Atlas Retail Indonesia",
    contactName: "Raka Mahendra",
    email: "raka@atlasretail.co.id",
    phone: "+62 21 555 0168",
    segment: "ENTERPRISE",
    status: "ACTIVE",
    createdAt: new Date("2026-04-02T04:00:00.000Z"),
    updatedAt: new Date("2026-08-12T02:00:00.000Z"),
  },
  {
    id: "CUST-0152",
    companyName: "PT Garuda Solusi",
    contactName: "Sinta Rahma",
    email: "sinta@garudasolusi.co.id",
    phone: "+62 21 555 0152",
    segment: "SMB",
    status: "ACTIVE",
    createdAt: new Date("2026-04-18T03:00:00.000Z"),
    updatedAt: new Date("2026-08-09T04:00:00.000Z"),
  },
] satisfies Array<typeof customers.$inferInsert>;

const quotationSeed = [
  {
    id: "QT-2026-0042",
    customerId: "CUST-0192",
    customerName: "PT Nusantara Teknologi",
    subtotal: 320_000_000,
    discount: 10_000_000,
    total: 310_000_000,
    currency: "IDR",
    status: "ACCEPTED",
    convertedOrderId: null,
    createdAt: new Date("2026-08-28T09:30:00.000Z"),
    updatedAt: new Date("2026-08-30T04:15:00.000Z"),
  },
  {
    id: "QT-2026-0041",
    customerId: "CUST-0188",
    customerName: "PT Sinar Digital Indonesia",
    subtotal: 97_500_000,
    discount: 2_500_000,
    total: 95_000_000,
    currency: "IDR",
    status: "SENT",
    convertedOrderId: null,
    createdAt: new Date("2026-08-26T02:00:00.000Z"),
    updatedAt: new Date("2026-08-27T06:30:00.000Z"),
  },
  {
    id: "QT-2026-0040",
    customerId: "CUST-0179",
    customerName: "PT Aruna Commerce",
    subtotal: 280_000_000,
    discount: 0,
    total: 280_000_000,
    currency: "IDR",
    status: "DRAFT",
    convertedOrderId: null,
    createdAt: new Date("2026-08-24T08:00:00.000Z"),
    updatedAt: new Date("2026-08-24T08:00:00.000Z"),
  },
] satisfies Array<typeof quotations.$inferInsert>;

const quotationItemSeed = [
  {
    id: "ITEM-001",
    quotationId: "QT-2026-0042",
    sku: "MBP-M4-14",
    name: "MacBook Pro 14 M4",
    quantity: 10,
    unitPrice: 30_000_000,
    lineTotal: 300_000_000,
  },
  {
    id: "ITEM-002",
    quotationId: "QT-2026-0042",
    sku: "DOCK-USBC",
    name: "USB-C Dock",
    quantity: 10,
    unitPrice: 2_000_000,
    lineTotal: 20_000_000,
  },
  {
    id: "ITEM-003",
    quotationId: "QT-2026-0041",
    sku: "MON-4K-27",
    name: "27-inch 4K Monitor",
    quantity: 15,
    unitPrice: 6_500_000,
    lineTotal: 97_500_000,
  },
  {
    id: "ITEM-004",
    quotationId: "QT-2026-0040",
    sku: "LAPTOP-BIZ-01",
    name: "Business Laptop",
    quantity: 20,
    unitPrice: 14_000_000,
    lineTotal: 280_000_000,
  },
] satisfies Array<typeof quotationItems.$inferInsert>;

const orderSeed = [
  {
    id: "ORD-2026-0181",
    sourceQuotationId: "QT-2026-0039",
    customerId: "CUST-0175",
    customerName: "PT Meridian Digital",
    subtotal: 168_000_000,
    discount: 8_000_000,
    total: 160_000_000,
    currency: "IDR",
    status: "PENDING",
    createdAt: new Date("2026-08-27T03:00:00.000Z"),
    updatedAt: new Date("2026-08-27T03:00:00.000Z"),
  },
  {
    id: "ORD-2026-0180",
    sourceQuotationId: "QT-2026-0038",
    customerId: "CUST-0168",
    customerName: "PT Atlas Retail Indonesia",
    subtotal: 170_000_000,
    discount: 5_000_000,
    total: 165_000_000,
    currency: "IDR",
    status: "PROCESSING",
    createdAt: new Date("2026-08-25T04:30:00.000Z"),
    updatedAt: new Date("2026-08-28T07:00:00.000Z"),
  },
  {
    id: "ORD-2026-0179",
    sourceQuotationId: "QT-2026-0037",
    customerId: "CUST-0152",
    customerName: "PT Garuda Solusi",
    subtotal: 150_000_000,
    discount: 0,
    total: 150_000_000,
    currency: "IDR",
    status: "SHIPPED",
    createdAt: new Date("2026-08-22T02:15:00.000Z"),
    updatedAt: new Date("2026-08-29T05:45:00.000Z"),
  },
] satisfies Array<typeof orders.$inferInsert>;

const orderItemSeed = [
  {
    id: "ORDER-ITEM-001",
    orderId: "ORD-2026-0181",
    sku: "LAPTOP-BIZ-01",
    name: "Business Laptop",
    quantity: 12,
    unitPrice: 14_000_000,
    lineTotal: 168_000_000,
  },
  {
    id: "ORDER-ITEM-002",
    orderId: "ORD-2026-0180",
    sku: "MON-4K-27",
    name: "27-inch 4K Monitor",
    quantity: 20,
    unitPrice: 6_500_000,
    lineTotal: 130_000_000,
  },
  {
    id: "ORDER-ITEM-003",
    orderId: "ORD-2026-0180",
    sku: "DOCK-USBC",
    name: "USB-C Dock",
    quantity: 20,
    unitPrice: 2_000_000,
    lineTotal: 40_000_000,
  },
  {
    id: "ORDER-ITEM-004",
    orderId: "ORD-2026-0179",
    sku: "MBP-M4-14",
    name: "MacBook Pro 14 M4",
    quantity: 5,
    unitPrice: 30_000_000,
    lineTotal: 150_000_000,
  },
] satisfies Array<typeof orderItems.$inferInsert>;

const paymentSeed = [
  {
    id: "PAY-2026-0091",
    orderId: "ORD-2026-0181",
    amount: 160_000_000,
    currency: "IDR",
    method: "BANK_TRANSFER",
    status: "PENDING",
    reference: "INV-2026-0181",
    createdAt: new Date("2026-08-27T03:15:00.000Z"),
    updatedAt: new Date("2026-08-27T03:15:00.000Z"),
    paidAt: null,
    refundedAt: null,
  },
  {
    id: "PAY-2026-0090",
    orderId: "ORD-2026-0180",
    amount: 165_000_000,
    currency: "IDR",
    method: "VIRTUAL_ACCOUNT",
    status: "PAID",
    reference: "INV-2026-0180",
    createdAt: new Date("2026-08-25T04:45:00.000Z"),
    updatedAt: new Date("2026-08-26T02:00:00.000Z"),
    paidAt: new Date("2026-08-26T02:00:00.000Z"),
    refundedAt: null,
  },
  {
    id: "PAY-2026-0089",
    orderId: "ORD-2026-0179",
    amount: 150_000_000,
    currency: "IDR",
    method: "CARD",
    status: "PAID",
    reference: "INV-2026-0179",
    createdAt: new Date("2026-08-22T02:30:00.000Z"),
    updatedAt: new Date("2026-08-22T06:15:00.000Z"),
    paidAt: new Date("2026-08-22T06:15:00.000Z"),
    refundedAt: null,
  },
] satisfies Array<typeof payments.$inferInsert>;

async function seedDatabase() {
  const { db, pool } = await import("@/db/client");

  try {
    console.log("Seeding Commerce Operations database...");

    await db.transaction(async (tx) => {
      for (const customer of customerSeed) {
        await tx
          .insert(customers)
          .values(customer)
          .onConflictDoUpdate({
            target: customers.id,
            set: {
              companyName: customer.companyName,
              contactName: customer.contactName,
              email: customer.email,
              phone: customer.phone,
              segment: customer.segment,
              status: customer.status,
              createdAt: customer.createdAt,
              updatedAt: customer.updatedAt,
            },
          });
      }

      for (const quotation of quotationSeed) {
        await tx
          .insert(quotations)
          .values(quotation)
          .onConflictDoUpdate({
            target: quotations.id,
            set: {
              customerId: quotation.customerId,
              customerName: quotation.customerName,
              subtotal: quotation.subtotal,
              discount: quotation.discount,
              total: quotation.total,
              currency: quotation.currency,
              status: quotation.status,
              convertedOrderId: quotation.convertedOrderId,
              createdAt: quotation.createdAt,
              updatedAt: quotation.updatedAt,
            },
          });
      }

      for (const item of quotationItemSeed) {
        await tx
          .insert(quotationItems)
          .values(item)
          .onConflictDoUpdate({
            target: quotationItems.id,
            set: {
              quotationId: item.quotationId,
              sku: item.sku,
              name: item.name,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              lineTotal: item.lineTotal,
            },
          });
      }

      for (const order of orderSeed) {
        await tx
          .insert(orders)
          .values(order)
          .onConflictDoUpdate({
            target: orders.id,
            set: {
              sourceQuotationId: order.sourceQuotationId,
              customerId: order.customerId,
              customerName: order.customerName,
              subtotal: order.subtotal,
              discount: order.discount,
              total: order.total,
              currency: order.currency,
              status: order.status,
              createdAt: order.createdAt,
              updatedAt: order.updatedAt,
            },
          });
      }

      for (const item of orderItemSeed) {
        await tx
          .insert(orderItems)
          .values(item)
          .onConflictDoUpdate({
            target: orderItems.id,
            set: {
              orderId: item.orderId,
              sku: item.sku,
              name: item.name,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              lineTotal: item.lineTotal,
            },
          });
      }

      for (const payment of paymentSeed) {
        await tx
          .insert(payments)
          .values(payment)
          .onConflictDoUpdate({
            target: payments.id,
            set: {
              orderId: payment.orderId,
              amount: payment.amount,
              currency: payment.currency,
              method: payment.method,
              status: payment.status,
              reference: payment.reference,
              createdAt: payment.createdAt,
              updatedAt: payment.updatedAt,
              paidAt: payment.paidAt,
              refundedAt: payment.refundedAt,
            },
          });
      }
    });

    console.log("");
    console.log("✓ Database seeded successfully.");
    console.log("");

    console.log(`  Customers:       ${customerSeed.length}`);

    console.log(`  Quotations:      ${quotationSeed.length}`);

    console.log(`  Quotation items: ${quotationItemSeed.length}`);

    console.log(`  Orders:          ${orderSeed.length}`);

    console.log(`  Order items:     ${orderItemSeed.length}`);

    console.log(`  Payments:        ${paymentSeed.length}`);
  } finally {
    await pool.end();
  }
}

seedDatabase().catch((error) => {
  console.error("");
  console.error("✗ Database seed failed.");
  console.error("");
  console.error(error);

  process.exitCode = 1;
});
