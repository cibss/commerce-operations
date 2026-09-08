import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";

const { Pool } = pg;

config({
  path: ".env.local",
});

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("Missing DATABASE_URL environment variable.");
}

const pool = new Pool({
  connectionString: databaseUrl,
});

const db = drizzle(pool);

try {
  console.log("Applying database migrations...");

  await migrate(db, {
    migrationsFolder: "./drizzle",
  });

  console.log("✓ Database migrations applied successfully.");
} catch (error) {
  console.error("\n✗ Database migration failed.\n");

  console.error(error);

  process.exitCode = 1;
} finally {
  await pool.end();
}
