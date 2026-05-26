import {
  pgTable,
  uuid,
  timestamp,
  text,
  index,
} from "drizzle-orm/pg-core";
import { responsesTable } from "./response";
import { formFieldsTable } from "./form-field";

export const responseAnswersTable = pgTable(
  "response_answers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    responseId: uuid("response_id")
      .notNull()
      .references(() => responsesTable.id, { onDelete: "cascade" }),
    fieldId: uuid("field_id")
      .notNull()
      .references(() => formFieldsTable.id, { onDelete: "cascade" }),
    value: text("value"), // serialized answer — app layer handles type conversion
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_answers_response").on(table.responseId),
    index("idx_answers_field").on(table.fieldId),
  ],
);

export type SelectResponseAnswer = typeof responseAnswersTable.$inferSelect;
export type InsertResponseAnswer = typeof responseAnswersTable.$inferInsert;
