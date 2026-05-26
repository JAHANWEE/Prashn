import { db, eq, and, desc, sql, like, or } from "@repo/database";
import {
  formsTable,
  formFieldsTable,
  responsesTable,
  type SelectForm,
  type InsertForm,
} from "@repo/database/schema";
import { logger } from "@repo/logger";

function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base}-${suffix}`;
}

export interface FormListOptions {
  creatorId: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface FormWithMeta extends SelectForm {
  _count?: { fields: number; responses: number };
}

class FormService {
  async create(data: {
    creatorId: string;
    title: string;
    description?: string;
  }): Promise<SelectForm> {
    const slug = generateSlug(data.title);

    const [form] = await db
      .insert(formsTable)
      .values({
        creatorId: data.creatorId,
        title: data.title,
        description: data.description ?? null,
        slug,
        status: "draft",
        visibility: "public",
      })
      .returning();

    logger.info("Form created", { formId: form!.id, slug });
    return form!;
  }

  async list(options: FormListOptions): Promise<{ forms: SelectForm[]; total: number }> {
    const { creatorId, status, search, page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    const conditions = [eq(formsTable.creatorId, creatorId)];

    if (status) {
      conditions.push(eq(formsTable.status, status));
    }

    if (search) {
      conditions.push(
        or(
          like(formsTable.title, `%${search}%`),
          like(formsTable.slug, `%${search}%`),
        )!,
      );
    }

    const where = and(...conditions);

    const [forms, countResult] = await Promise.all([
      db
        .select()
        .from(formsTable)
        .where(where)
        .orderBy(desc(formsTable.updatedAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(formsTable)
        .where(where),
    ]);

    return { forms, total: countResult[0]?.count ?? 0 };
  }

  async getById(formId: string, creatorId: string): Promise<SelectForm | null> {
    const [form] = await db
      .select()
      .from(formsTable)
      .where(and(eq(formsTable.id, formId), eq(formsTable.creatorId, creatorId)))
      .limit(1);

    return form ?? null;
  }

  async getBySlug(slug: string): Promise<SelectForm | null> {
    const [form] = await db
      .select()
      .from(formsTable)
      .where(eq(formsTable.slug, slug))
      .limit(1);

    return form ?? null;
  }

  async update(
    formId: string,
    creatorId: string,
    data: Partial<Pick<InsertForm, "title" | "description" | "settings" | "themeId" | "expiresAt" | "responseLimit" | "passwordHash">>,
  ): Promise<SelectForm | null> {
    const [updated] = await db
      .update(formsTable)
      .set(data)
      .where(and(eq(formsTable.id, formId), eq(formsTable.creatorId, creatorId)))
      .returning();

    return updated ?? null;
  }

  async publish(formId: string, creatorId: string): Promise<SelectForm | null> {
    const [updated] = await db
      .update(formsTable)
      .set({ status: "published", publishedAt: new Date() })
      .where(and(eq(formsTable.id, formId), eq(formsTable.creatorId, creatorId)))
      .returning();

    if (updated) {
      logger.info("Form published", { formId });
    }
    return updated ?? null;
  }

  async unpublish(formId: string, creatorId: string): Promise<SelectForm | null> {
    const [updated] = await db
      .update(formsTable)
      .set({ status: "unpublished" })
      .where(and(eq(formsTable.id, formId), eq(formsTable.creatorId, creatorId)))
      .returning();

    return updated ?? null;
  }

  async archive(formId: string, creatorId: string): Promise<SelectForm | null> {
    const [updated] = await db
      .update(formsTable)
      .set({ status: "archived" })
      .where(and(eq(formsTable.id, formId), eq(formsTable.creatorId, creatorId)))
      .returning();

    return updated ?? null;
  }

  async unarchive(formId: string, creatorId: string): Promise<SelectForm | null> {
    const [updated] = await db
      .update(formsTable)
      .set({ status: "draft" })
      .where(and(eq(formsTable.id, formId), eq(formsTable.creatorId, creatorId)))
      .returning();

    if (updated) {
      logger.info("Form unarchived", { formId });
    }
    return updated ?? null;
  }

  async updateVisibility(
    formId: string,
    creatorId: string,
    visibility: "public" | "unlisted",
  ): Promise<SelectForm | null> {
    const [updated] = await db
      .update(formsTable)
      .set({ visibility })
      .where(and(eq(formsTable.id, formId), eq(formsTable.creatorId, creatorId)))
      .returning();

    return updated ?? null;
  }

  async clone(formId: string, creatorId: string): Promise<SelectForm | null> {
    // Get original form
    const original = await this.getById(formId, creatorId);
    if (!original) return null;

    // Create new form
    const newSlug = generateSlug(`${original.title} Copy`);
    const [cloned] = await db
      .insert(formsTable)
      .values({
        creatorId,
        title: `${original.title} (Copy)`,
        description: original.description,
        slug: newSlug,
        status: "draft",
        visibility: original.visibility,
        themeId: original.themeId,
        settings: original.settings,
      })
      .returning();

    if (!cloned) return null;

    // Clone fields
    const fields = await db
      .select()
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, formId))
      .orderBy(formFieldsTable.position);

    if (fields.length > 0) {
      await db.insert(formFieldsTable).values(
        fields.map((f) => ({
          formId: cloned.id,
          label: f.label,
          description: f.description,
          fieldType: f.fieldType,
          placeholder: f.placeholder,
          options: f.options,
          validations: f.validations,
          required: f.required,
          position: f.position,
          page: f.page,
          conditionalLogic: f.conditionalLogic,
        })),
      );
    }

    logger.info("Form cloned", { originalId: formId, clonedId: cloned.id });
    return cloned;
  }

  async delete(formId: string, creatorId: string): Promise<boolean> {
    const result = await db
      .delete(formsTable)
      .where(and(eq(formsTable.id, formId), eq(formsTable.creatorId, creatorId)));

    return true;
  }

  /**
   * Get response count for a form (used for limit checking).
   */
  async getResponseCount(formId: string): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(responsesTable)
      .where(eq(responsesTable.formId, formId));

    return result?.count ?? 0;
  }
}

export default FormService;
