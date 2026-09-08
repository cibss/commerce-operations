import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "@/db/schema";

type DatabasePool = Pool;

type DatabaseClient = ReturnType<typeof drizzle<typeof schema>>;

const globalForDatabase = globalThis as unknown as {
  commerceDatabasePool?: DatabasePool;

  commerceDatabaseClient?: DatabaseClient;
};

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("Missing DATABASE_URL environment variable.");
  }

  return databaseUrl;
}

export function getDatabasePool() {
  if (globalForDatabase.commerceDatabasePool) {
    return globalForDatabase.commerceDatabasePool;
  }

  const pool = new Pool({
    connectionString: getDatabaseUrl(),
  });

  if (process.env.NODE_ENV !== "production") {
    globalForDatabase.commerceDatabasePool = pool;
  }

  return pool;
}

export function getDatabase() {
  if (globalForDatabase.commerceDatabaseClient) {
    return globalForDatabase.commerceDatabaseClient;
  }

  const database = drizzle(getDatabasePool(), {
    schema,
  });

  if (process.env.NODE_ENV !== "production") {
    globalForDatabase.commerceDatabaseClient = database;
  }

  return database;
}
