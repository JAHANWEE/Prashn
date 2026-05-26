import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  text,
} from "drizzle-orm/pg-core";
import { usersTable } from "./user";
import { formsTable } from "./form";

export const emailNotificationsTable = pgTable("email_notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  formId: uuid("form_id").references(() => formsTable.id, { onDelete: "set null" }),
  type: varchar("type", { length: 30 }).notNull(), // new_response | form_published | response_limit_reached | form_expired
  subject: varchar("subject", { length: 255 }).notNull(),
  body: text("body").notNull(),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending | sent | failed
  resendId: text("resend_id"), // Resend message ID for tracking
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type SelectEmailNotification = typeof emailNotificationsTable.$inferSelect;
export type InsertEmailNotification = typeof emailNotificationsTable.$inferInsert;
