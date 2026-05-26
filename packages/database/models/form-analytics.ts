import {
  pgTable,
  uuid,
  timestamp,
  integer,
  date,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { formsTable } from "./form";

export const formAnalyticsTable = pgTable(
  "form_analytics",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    formId: uuid("form_id")
      .notNull()
      .references(() => formsTable.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    views: integer("views").notNull().default(0),
    starts: integer("starts").notNull().default(0),
    completions: integer("completions").notNull().default(0),
    abandons: integer("abandons").notNull().default(0),
    avgDurationSeconds: integer("avg_duration_seconds"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_form_analytics_form_date").on(table.formId, table.date),
    unique("uq_form_analytics_form_date").on(table.formId, table.date),
  ],
);

export type SelectFormAnalytics = typeof formAnalyticsTable.$inferSelect;
export type InsertFormAnalytics = typeof formAnalyticsTable.$inferInsert;
