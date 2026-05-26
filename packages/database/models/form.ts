import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  text,
  integer,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { usersTable } from "./user";
import { themesTable } from "./theme";

export const formsTable = pgTable(
  "forms",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    creatorId: uuid("creator_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    slug: varchar("slug", { length: 100 }).notNull().unique(),
    status: varchar("status", { length: 20 }).notNull().default("draft"), // draft | published | unpublished | archived
    visibility: varchar("visibility", { length: 20 }).notNull().default("public"), // public | unlisted
    themeId: uuid("theme_id").references(() => themesTable.id, { onDelete: "set null" }),
    settings: jsonb("settings").notNull().default({}), // { allow_multiple_submissions, show_progress_bar, confirmation_message, redirect_url }
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    responseLimit: integer("response_limit"),
    passwordHash: text("password_hash"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("idx_forms_creator").on(table.creatorId),
    index("idx_forms_slug").on(table.slug),
    index("idx_forms_status_visibility").on(table.status, table.visibility),
  ],
);

export type SelectForm = typeof formsTable.$inferSelect;
export type InsertForm = typeof formsTable.$inferInsert;
