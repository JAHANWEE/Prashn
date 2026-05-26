import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  text,
  integer,
  boolean,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { formsTable } from "./form";

export const formFieldsTable = pgTable(
  "form_fields",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    formId: uuid("form_id")
      .notNull()
      .references(() => formsTable.id, { onDelete: "cascade" }),
    label: varchar("label", { length: 500 }).notNull(),
    description: text("description"),
    fieldType: varchar("field_type", { length: 30 }).notNull(), // short_text | long_text | email | number | single_select | multi_select | checkbox | dropdown | rating | date
    placeholder: text("placeholder"),
    options: jsonb("options"), // [{label, value}] for select/dropdown types
    validations: jsonb("validations"), // {min, max, min_length, max_length, pattern, custom_message}
    required: boolean("required").notNull().default(false),
    position: integer("position").notNull(),
    page: integer("page").notNull().default(1),
    conditionalLogic: jsonb("conditional_logic"), // {show_if: {field_id, operator, value}}
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("idx_fields_form_position").on(table.formId, table.position),
  ],
);

export type SelectFormField = typeof formFieldsTable.$inferSelect;
export type InsertFormField = typeof formFieldsTable.$inferInsert;
