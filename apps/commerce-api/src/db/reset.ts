import { config } from "dotenv";

config({
  path: ".env.local",
});

async function resetDatabase() {
  if (process.env.VERCEL_ENV === "production") {
    throw new Error("Database reset is disabled in Vercel production.");
  }

  const { getDatabasePool } = await import("@/db/client");

  const pool = getDatabasePool();

  const client = await pool.connect();

  try {
    console.log("Resetting Commerce Operations database...");

    await client.query("BEGIN");

    await client.query(`
      TRUNCATE TABLE
        quotation_items,
        payments,
        order_items,
        quotations,
        orders,
        customers
      RESTART IDENTITY
      CASCADE
    `);

    await client.query("COMMIT");

    console.log("✓ Database tables cleared successfully.");
  } catch (error) {
    await client.query("ROLLBACK");

    throw error;
  } finally {
    client.release();

    await pool.end();
  }
}

resetDatabase().catch((error) => {
  console.error("");
  console.error("✗ Database reset failed.");
  console.error("");
  console.error(error);

  process.exitCode = 1;
});
