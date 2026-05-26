import { db, eq, and, sql, asc } from "@repo/database";
import {
  formFieldsTable,
  formsTable,
  type SelectFormField,
  type InsertFormField,
} from "@repo/database/schema";
import { logger } from "@repo/logger";

export const FIELD_TYPES = [
  "short_text",
  "long_text",
  "email",
  "number",
  "single_select",
  "multi_select",
  "checkbox",
  "dropdown",
  "rating",
  "date",
] as const;

export type FieldType = (typeof FIELD_TYPES)[number];

class FieldService {
  /**
   * Create a new field at the end of the form (auto-position).
   */
  async create(data: {
    formId: string;
    creatorId: string;
    label: string;
    description?: string;
    fieldType: FieldType;
    placeholder?: string;
    options?: unknown;
    validations?: unknown;
    required?: boolean;
    page?: number;
    conditionalLogic?: unknown;
  }): Promise<SelectFormField | null> {
    // Verify form ownership
    const [form] = await db
      .select({ id: formsTable.id })
      .from(formsTable)
      .where(and(eq(formsTable.id, data.formId), eq(formsTable.creatorId, data.creatorId)))
      .limit(1);

    if (!form) return null;

    // Get next position
    const [maxPos] = await db
      .select({ max: sql<number>`coalesce(max(position), 0)` })
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, data.formId));

    const position = (maxPos?.max ?? 0) + 1;

    const [field] = await db
      .insert(formFieldsTable)
      .values({
        formId: data.formId,
        label: data.label,
        description: data.description ?? null,
        fieldType: data.fieldType,
        placeholder: data.placeholder ?? null,
        options: data.options ?? null,
        validations: data.validations ?? null,
        required: data.required ?? false,
        position,
        page: data.page ?? 1,
        conditionalLogic: data.conditionalLogic ?? null,
      })
      .returning();

    logger.info("Field created", { fieldId: field!.id, formId: data.formId, position });
    return field!;
  }

  /**
   * List all fields for a form, ordered by position.
   */
  async listByFormId(formId: string, creatorId: string): Promise<SelectFormField[]> {
    // Verify ownership
    const [form] = await db
      .select({ id: formsTable.id })
      .from(formsTable)
      .where(and(eq(formsTable.id, formId), eq(formsTable.creatorId, creatorId)))
      .limit(1);

    if (!form) return [];

    return db
      .select()
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, formId))
      .orderBy(asc(formFieldsTable.position));
  }

  /**
   * List fields by form ID without ownership check (for public form rendering).
   */
  async listByFormIdPublic(formId: string): Promise<SelectFormField[]> {
    return db
      .select()
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, formId))
      .orderBy(asc(formFieldsTable.position));
  }

  /**
   * Update a field's properties.
   */
  async update(
    fieldId: string,
    creatorId: string,
    data: Partial<Pick<InsertFormField, "label" | "description" | "fieldType" | "placeholder" | "options" | "validations" | "required" | "page" | "conditionalLogic">>,
  ): Promise<SelectFormField | null> {
    // Verify ownership via join
    const [existing] = await db
      .select({ fieldId: formFieldsTable.id })
      .from(formFieldsTable)
      .innerJoin(formsTable, eq(formFieldsTable.formId, formsTable.id))
      .where(and(eq(formFieldsTable.id, fieldId), eq(formsTable.creatorId, creatorId)))
      .limit(1);

    if (!existing) return null;

    const [updated] = await db
      .update(formFieldsTable)
      .set(data)
      .where(eq(formFieldsTable.id, fieldId))
      .returning();

    return updated ?? null;
  }

  /**
   * Delete a field and reorder remaining fields.
   */
  async delete(fieldId: string, creatorId: string): Promise<boolean> {
    // Get field with form ownership check
    const [existing] = await db
      .select({ fieldId: formFieldsTable.id, formId: formFieldsTable.formId, position: formFieldsTable.position })
      .from(formFieldsTable)
      .innerJoin(formsTable, eq(formFieldsTable.formId, formsTable.id))
      .where(and(eq(formFieldsTable.id, fieldId), eq(formsTable.creatorId, creatorId)))
      .limit(1);

    if (!existing) return false;

    // Delete the field
    await db.delete(formFieldsTable).where(eq(formFieldsTable.id, fieldId));

    // Reorder remaining fields (decrement positions above the deleted one)
    await db
      .update(formFieldsTable)
      .set({ position: sql`position - 1` })
      .where(
        and(
          eq(formFieldsTable.formId, existing.formId),
          sql`position > ${existing.position}`,
        ),
      );

    logger.info("Field deleted and reordered", { fieldId, formId: existing.formId });
    return true;
  }

  /**
   * Bulk reorder fields within a form.
   * Accepts an array of { fieldId, position } pairs.
   */
  async reorder(
    formId: string,
    creatorId: string,
    order: Array<{ fieldId: string; position: number }>,
  ): Promise<boolean> {
    // Verify ownership
    const [form] = await db
      .select({ id: formsTable.id })
      .from(formsTable)
      .where(and(eq(formsTable.id, formId), eq(formsTable.creatorId, creatorId)))
      .limit(1);

    if (!form) return false;

    // Update positions in a transaction-like batch
    await Promise.all(
      order.map(({ fieldId, position }) =>
        db
          .update(formFieldsTable)
          .set({ position })
          .where(and(eq(formFieldsTable.id, fieldId), eq(formFieldsTable.formId, formId))),
      ),
    );

    logger.info("Fields reordered", { formId, count: order.length });
    return true;
  }
}

export default FieldService;
