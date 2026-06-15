import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// चौकी अकाउंट — Google OAuth से लॉगिन। सिंगल-टेनेंट: एक चौकी = एक ईमेल।
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  googleId: text("google_id").notNull().unique(),
  email: text("email").notNull(),
  name: text("name"),
  picture: text("picture"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// मुवक्किल — एक मुवक्किल के कई केस हो सकते हैं।
export const clients = sqliteTable("clients", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),          // चौकी (सिंगल-टेनेंट)
  name: text("name").notNull(),
  phone: text("phone"),                          // wa.me रिमाइंडर इसी पर जाएगा
  address: text("address"),
  notes: text("notes"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// केस — पेशी ट्रैकिंग का दिल। मुवक्किल से जुड़ा।
export const cases = sqliteTable("cases", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),                        // चौकी (सिंगल-टेनेंट)
  clientId: integer("client_id").notNull().references(() => clients.id),
  caseNumber: text("case_number").notNull(),
  courtName: text("court_name"),
  caseType: text("case_type"),
  oppositeParty: text("opposite_party"),
  nextHearingDate: text("next_hearing_date"),                  // "YYYY-MM-DD"
  stage: text("stage"),                                        // अगली तारीख़ किस चीज़ के लिए
  notes: text("notes"),
  status: text("status").default("active"),                    // active | disposed
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});