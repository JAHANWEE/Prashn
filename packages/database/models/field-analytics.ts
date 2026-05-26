import {
  pgTable,
  uuid,
  timestamp,
  integer,
  date,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { formFieldsTable } from "./form-field";
import { formsTable } from "./form";

export const fieldAnalyticsTable = pgTable(
  "field_analytics",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    fieldId: uuid("field_id")
      .notNull()
      .references(() => formFieldsTable.id, { onDelete: "cascade" }),
    formId: uuid("form_id")
      .notNull()
      .references(() => formsTable.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    views: integer("views").notNull().default(0),
    dropOffs: integer("drop_offs").notNull().default(0),
    avgTimeSeconds: integer("avg_time_seconds"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_field_analytics_field_date").on(table.fieldId, table.date),
    unique("uq_field_analytics_field_date").on(table.fieldId, table.date),
  ],
);

export type SelectFieldAnalytics = typeof fieldAnalyticsTable.$inferSelect;
export type InsertFieldAnalytics = typeof fieldAnalyticsTable.$inferInsert;
