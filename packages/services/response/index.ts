import { db, eq, and, desc, sql, like, or, between } from "@repo/database";
import {
  responsesTable,
  responseAnswersTable,
  formsTable,
  formFieldsTable,
  formAnalyticsTable,
  type SelectResponse,
  type InsertResponse,
} from "@repo/database/schema";
import { logger } from "@repo/logger";

export interface SubmitResponseInput {
  formId: string;
  answers: Array<{ fieldId: string; value: string | null }>;
  respondentEmail?: string;
  respondentName?: string;
  metadata?: { ip?: string; userAgent?: string; referrer?: string; source?: string };
}

export interface ResponseListOptions {
  formId: string;
  creatorId: string;
  status?: string;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
  sortBy?: "created_at" | "completed_at" | "duration_seconds";
  sortOrder?: "asc" | "desc";
}

class ResponseService {
  /**
   * Submit a public form response (creates response + answers in a transaction).
   */
  async submit(input: SubmitResponseInput): Promise<SelectResponse> {
    const now = new Date();
    const today = now.toISOString().split("T")[0]!;

    // Wrap in transaction for atomicity
    const result = await db.transaction(async (tx) => {
      // Create response
      const [response] = await tx
        .insert(responsesTable)
        .values({
          formId: input.formId,
          respondentEmail: input.respondentEmail ?? null,
          respondentName: input.respondentName ?? null,
          status: "completed",
          startedAt: now,
          completedAt: now,
          durationSeconds: 0,
          metadata: input.metadata ?? null,
        })
        .returning();

      if (!response) {
        throw new Error("Failed to create response");
      }

      // Insert answers
      if (input.answers.length > 0) {
        await tx.insert(responseAnswersTable).values(
          input.answers.map((a) => ({
            responseId: response.id,
            fieldId: a.fieldId,
            value: a.value,
          })),
        );
      }

      // Update daily analytics (upsert)
      await tx
        .insert(formAnalyticsTable)
        .values({
          formId: input.formId,
          date: today,
          completions: 1,
          starts: 1,
        })
        .onConflictDoUpdate({
          target: [formAnalyticsTable.formId, formAnalyticsTable.date],
          set: {
            completions: sql`${formAnalyticsTable.completions} + 1`,
            starts: sql`${formAnalyticsTable.starts} + 1`,
          },
        });

      return response;
    });

    logger.info("Response submitted", { responseId: result.id, formId: input.formId });
    return result;
  }

  /**
   * List responses for a form (creator-only, paginated).
   */
  async list(options: ResponseListOptions): Promise<{ responses: SelectResponse[]; total: number }> {
    const { formId, creatorId, status, search, dateFrom, dateTo, page = 1, limit = 20, sortOrder = "desc" } = options;

    // Verify form ownership
    const [form] = await db
      .select({ id: formsTable.id })
      .from(formsTable)
      .where(and(eq(formsTable.id, formId), eq(formsTable.creatorId, creatorId)))
      .limit(1);

    if (!form) return { responses: [], total: 0 };

    const conditions: any[] = [eq(responsesTable.formId, formId)];

    if (status) {
      conditions.push(eq(responsesTable.status, status));
    }

    if (search) {
      conditions.push(
        or(
          like(responsesTable.respondentEmail, `%${search}%`),
          like(responsesTable.respondentName, `%${search}%`),
        )!,
      );
    }

    if (dateFrom && dateTo) {
      conditions.push(between(responsesTable.createdAt, dateFrom, dateTo));
    }

    const where = and(...conditions);
    const offset = (page - 1) * limit;

    const [responses, countResult] = await Promise.all([
      db
        .select()
        .from(responsesTable)
        .where(where)
        .orderBy(sortOrder === "desc" ? desc(responsesTable.createdAt) : responsesTable.createdAt)
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(responsesTable)
        .where(where),
    ]);

    return { responses, total: countResult[0]?.count ?? 0 };
  }

  /**
   * Get a single response with all its answers.
   */
  async getById(responseId: string, creatorId: string) {
    const [response] = await db
      .select()
      .from(responsesTable)
      .innerJoin(formsTable, eq(responsesTable.formId, formsTable.id))
      .where(and(eq(responsesTable.id, responseId), eq(formsTable.creatorId, creatorId)))
      .limit(1);

    if (!response) return null;

    const answers = await db
      .select()
      .from(responseAnswersTable)
      .where(eq(responseAnswersTable.responseId, responseId));

    return { response: response.responses, answers };
  }

  /**
   * Delete a single response.
   */
  async delete(responseId: string, creatorId: string): Promise<boolean> {
    const [existing] = await db
      .select({ id: responsesTable.id })
      .from(responsesTable)
      .innerJoin(formsTable, eq(responsesTable.formId, formsTable.id))
      .where(and(eq(responsesTable.id, responseId), eq(formsTable.creatorId, creatorId)))
      .limit(1);

    if (!existing) return false;

    await db.delete(responsesTable).where(eq(responsesTable.id, responseId));
    return true;
  }

  /**
   * Bulk delete responses.
   */
  async bulkDelete(formId: string, creatorId: string, responseIds: string[]): Promise<number> {
    // Verify ownership
    const [form] = await db
      .select({ id: formsTable.id })
      .from(formsTable)
      .where(and(eq(formsTable.id, formId), eq(formsTable.creatorId, creatorId)))
      .limit(1);

    if (!form) return 0;

    let deleted = 0;
    for (const id of responseIds) {
      await db.delete(responsesTable).where(and(eq(responsesTable.id, id), eq(responsesTable.formId, formId)));
      deleted++;
    }

    return deleted;
  }

  /**
   * Export responses as flat objects (for CSV generation).
   */
  async exportForCsv(formId: string, creatorId: string) {
    // Verify ownership
    const [form] = await db
      .select({ id: formsTable.id })
      .from(formsTable)
      .where(and(eq(formsTable.id, formId), eq(formsTable.creatorId, creatorId)))
      .limit(1);

    if (!form) return [];

    // Get fields for column headers
    const fields = await db
      .select()
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, formId))
      .orderBy(formFieldsTable.position);

    // Get all responses with answers
    const responses = await db
      .select()
      .from(responsesTable)
      .where(and(eq(responsesTable.formId, formId), eq(responsesTable.status, "completed")))
      .orderBy(desc(responsesTable.createdAt));

    const allAnswers = await db
      .select()
      .from(responseAnswersTable)
      .innerJoin(responsesTable, eq(responseAnswersTable.responseId, responsesTable.id))
      .where(eq(responsesTable.formId, formId));

    // Build flat rows
    return responses.map((r) => {
      const row: Record<string, string> = {
        response_id: r.id,
        submitted_at: r.completedAt?.toISOString() ?? r.createdAt.toISOString(),
        respondent_email: r.respondentEmail ?? "",
        respondent_name: r.respondentName ?? "",
        status: r.status,
      };

      for (const field of fields) {
        const answer = allAnswers.find(
          (a) => a.response_answers.responseId === r.id && a.response_answers.fieldId === field.id,
        );
        row[field.label] = answer?.response_answers.value ?? "";
      }

      return row;
    });
  }
}

export default ResponseService;
