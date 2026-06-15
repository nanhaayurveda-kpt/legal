// DB की सारी पुरानी tables हटाने वाला script — एक बार का काम
import { createClient } from "@libsql/client";
import { config } from "dotenv";

config({ path: ".env.local" });

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// सारी user tables के नाम लाओ (sqlite internal छोड़कर)
const res = await db.execute(
  "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
);

// FK बंद करके एक-एक करके drop
await db.execute("PRAGMA foreign_keys = OFF");
for (const row of res.rows) {
  await db.execute(`DROP TABLE IF EXISTS "${row.name}"`);
  console.log("हटाई:", row.name);
}

console.log("DB अब पूरी तरह खाली है");