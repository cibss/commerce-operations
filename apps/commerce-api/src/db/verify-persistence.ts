import { config } from "dotenv";

config({
  path: ".env.local",
});

async function verifyPersistence() {
  const { getDatabasePool } = await import("@/db/client");

  const { CustomerRepository } =
    await import("@/repositories/CustomerRepository");

  const { QuotationRepository } =
    await import("@/repositories/QuotationRepository");

  const { OrderRepository } = await import("@/repositories/OrderRepository");

  const { PaymentRepository } =
    await import("@/repositories/PaymentRepository");

  const pool = getDatabasePool();

  try {
    console.log("Verifying persistent commerce data...");

    const [customers, quotations, orders, payments] = await Promise.all([
      CustomerRepository.list(),
      QuotationRepository.list(),
      OrderRepository.list(),
      PaymentRepository.list(),
    ]);

    console.log("");
    console.log(`Customers: ${customers.length}`);

    console.log(`Quotations: ${quotations.length}`);

    for (const quotation of quotations) {
      console.log(
        `  ${quotation.id} · ${quotation.status} · ${quotation.items.length} item(s)`,
      );
    }

    console.log("");
    console.log(`Orders: ${orders.length}`);

    for (const order of orders) {
      console.log(
        `  ${order.id} · ${order.status} · ${order.items.length} item(s)`,
      );
    }

    console.log("");
    console.log(`Payments: ${payments.length}`);

    for (const payment of payments) {
      console.log(`  ${payment.id} · ${payment.status} · ${payment.method}`);
    }

    if (customers.length !== 6) {
      throw new Error(`Expected 6 customers, received ${customers.length}.`);
    }

    if (quotations.length !== 3) {
      throw new Error(`Expected 3 quotations, received ${quotations.length}.`);
    }

    if (orders.length !== 3) {
      throw new Error(`Expected 3 orders, received ${orders.length}.`);
    }

    if (payments.length !== 3) {
      throw new Error(`Expected 3 payments, received ${payments.length}.`);
    }

    const quotation = await QuotationRepository.findById("QT-2026-0042");

    if (!quotation) {
      throw new Error("Expected QT-2026-0042 to exist.");
    }

    if (quotation.status !== "ACCEPTED") {
      throw new Error(
        `Expected QT-2026-0042 to be ACCEPTED, received ${quotation.status}.`,
      );
    }

    if (quotation.items.length !== 2) {
      throw new Error(
        `Expected QT-2026-0042 to contain 2 items, received ${quotation.items.length}.`,
      );
    }

    if (quotation.convertedOrderId !== null) {
      throw new Error("Expected QT-2026-0042 to have no converted order.");
    }

    const order = await OrderRepository.findById("ORD-2026-0181");

    if (!order) {
      throw new Error("Expected ORD-2026-0181 to exist.");
    }

    if (order.status !== "CONFIRMED") {
      throw new Error(
        `Expected ORD-2026-0181 to be CONFIRMED, received ${order.status}.`,
      );
    }

    const payment = await PaymentRepository.findById("PAY-2026-0091");

    if (!payment) {
      throw new Error("Expected PAY-2026-0091 to exist.");
    }

    if (payment.orderId !== order.id) {
      throw new Error(
        `Expected PAY-2026-0091 to belong to ${order.id}, received ${payment.orderId}.`,
      );
    }

    if (payment.amount !== order.total) {
      throw new Error(
        `Expected PAY-2026-0091 amount to equal order total ${order.total}, received ${payment.amount}.`,
      );
    }

    if (payment.status !== "PENDING") {
      throw new Error(
        `Expected PAY-2026-0091 to be PENDING, received ${payment.status}.`,
      );
    }

    if (payment.reference !== "INV-2026-0181") {
      throw new Error(
        `Expected PAY-2026-0091 reference to be INV-2026-0181, received ${payment.reference}.`,
      );
    }

    if (payment.paidAt !== null) {
      throw new Error("Expected PAY-2026-0091 paidAt to be null.");
    }

    if (payment.refundedAt !== null) {
      throw new Error("Expected PAY-2026-0091 refundedAt to be null.");
    }

    const paidPayment = await PaymentRepository.findById("PAY-2026-0090");

    if (!paidPayment) {
      throw new Error("Expected PAY-2026-0090 to exist.");
    }

    if (paidPayment.status !== "PAID") {
      throw new Error(
        `Expected PAY-2026-0090 to be PAID, received ${paidPayment.status}.`,
      );
    }

    if (paidPayment.paidAt === null) {
      throw new Error("Expected PAY-2026-0090 to have paidAt.");
    }

    console.log("");
    console.log("✓ Persistence verification successful.");
  } finally {
    await pool.end();
  }
}

verifyPersistence().catch((error) => {
  console.error("");
  console.error("✗ Persistence verification failed.");
  console.error("");
  console.error(error);

  process.exitCode = 1;
});
