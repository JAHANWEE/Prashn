import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  integer,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { formsTable } from "./form";

export const responsesTable = pgTable(
  "responses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    formId: uuid("form_id")
      .notNull()
      .references(() => formsTable.id, { onDelete: "cascade" }),
    respondentEmail: varchar("respondent_email", { length: 255 }),
    respondentName: varchar("respondent_name", { length: 100 }),
    status: varchar("status", { length: 20 }).notNull().default("in_progress"), // completed | abandoned | in_progress
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    durationSeconds: integer("duration_seconds"),
    metadata: jsonb("metadata"), // {ip, user_agent, referrer, source}
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_responses_form").on(table.formId),
    index("idx_responses_form_status").on(table.formId, table.status),
    index("idx_responses_form_created").on(table.formId, table.createdAt),
  ],
);

export type SelectResponse = typeof responsesTable.$inferSelect;
export type InsertResponse = typeof responsesTable.$inferInsert;
