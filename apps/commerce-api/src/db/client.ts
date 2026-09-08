import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "@/db/schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("Missing DATABASE_URL environment variable.");
}

const globalForDatabase = globalThis as unknown as {
  commerceDatabasePool?: Pool;
};

const pool =
  globalForDatabase.commerceDatabasePool ??
  new Pool({
    connectionString: databaseUrl,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDatabase.commerceDatabasePool = pool;
}

export const db = drizzle(pool, {
  schema,
});

export { pool };
