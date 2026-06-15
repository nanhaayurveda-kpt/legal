import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

// Turso/libSQL client — env से URL और auth token
const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Drizzle instance — schema पास करने से typed queries मिलती हैं
export const db = drizzle(client, { schema });