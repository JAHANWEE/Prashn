import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
  text,
} from "drizzle-orm/pg-core";
import { usersTable } from "./user";

export const themesTable = pgTable("themes", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  creatorId: uuid("creator_id").references(() => usersTable.id, { onDelete: "set null" }),
  isSystem: boolean("is_system").notNull().default(false),
  primaryColor: varchar("primary_color", { length: 7 }).notNull(),
  backgroundColor: varchar("background_color", { length: 7 }).notNull(),
  textColor: varchar("text_color", { length: 7 }).notNull(),
  fontFamily: varchar("font_family", { length: 50 }).notNull().default("Inter"),
  borderRadius: varchar("border_radius", { length: 10 }).notNull().default("8px"),
  logoUrl: text("logo_url"),
  coverImageUrl: text("cover_image_url"),
  customCss: text("custom_css"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type SelectTheme = typeof themesTable.$inferSelect;
export type InsertTheme = typeof themesTable.$inferInsert;
