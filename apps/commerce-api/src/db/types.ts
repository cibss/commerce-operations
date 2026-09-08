import { getDatabase } from "@/db/client";

type Database = ReturnType<typeof getDatabase>;

export type DatabaseTransaction = Parameters<
  Parameters<Database["transaction"]>[0]
>[0];
