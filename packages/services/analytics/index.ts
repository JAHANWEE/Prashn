import { db, eq, and, sql, desc, between } from "@repo/database";
import {
  formAnalyticsTable,
  fieldAnalyticsTable,
  responsesTable,
  responseAnswersTable,
  formFieldsTable,
  formsTable,
} from "@repo/database/schema";

export interface AnalyticsOverview {
  totalResponses: number;
  completionRate: number;
  avgDurationSeconds: number;
  totalViews: number;
  totalStarts: number;
}

class AnalyticsService {
  /**
   * Get KPI overview for a form.
   */
  async getOverview(formId: string, creatorId: string): Promise<AnalyticsOverview | null> {
    // Verify ownership
    const [form] = await db
      .select({ id: formsTable.id })
      .from(formsTable)
      .where(and(eq(formsTable.id, formId), eq(formsTable.creatorId, creatorId)))
      .limit(1);

    if (!form) return null;

    const [stats] = await db
      .select({
        totalResponses: sql<number>`count(*)::int`,
        completed: sql<number>`count(*) filter (where status = 'completed')::int`,
        avgDuration: sql<number>`coalesce(avg(duration_seconds) filter (where duration_seconds > 0), 0)::int`,
      })
      .from(responsesTable)
      .where(eq(responsesTable.formId, formId));

    const [analyticsAgg] = await db
      .select({
        totalViews: sql<number>`coalesce(sum(views), 0)::int`,
        totalStarts: sql<number>`coalesce(sum(starts), 0)::int`,
      })
      .from(formAnalyticsTable)
      .where(eq(formAnalyticsTable.formId, formId));

    const totalResponses = stats?.totalResponses ?? 0;
    const completed = stats?.completed ?? 0;
    const completionRate = totalResponses > 0 ? Math.round((completed / totalResponses) * 1000) / 10 : 0;

    return {
      totalResponses,
      completionRate,
      avgDurationSeconds: stats?.avgDuration ?? 0,
      totalViews: analyticsAgg?.totalViews ?? 0,
      totalStarts: analyticsAgg?.totalStarts ?? 0,
    };
  }

  /**
   * Get daily response timeline for charting.
   */
  async getTimeline(
    formId: string,
    creatorId: string,
    days: number = 7,
  ): Promise<Array<{ date: string; views: number; starts: number; completions: number }>> {
    const [form] = await db
      .select({ id: formsTable.id })
      .from(formsTable)
      .where(and(eq(formsTable.id, formId), eq(formsTable.creatorId, creatorId)))
      .limit(1);

    if (!form) return [];

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split("T")[0]!;

    const rows = await db
      .select()
      .from(formAnalyticsTable)
      .where(
        and(
          eq(formAnalyticsTable.formId, formId),
          sql`${formAnalyticsTable.date} >= ${startDateStr}`,
        ),
      )
      .orderBy(formAnalyticsTable.date);

    return rows.map((r) => ({
      date: r.date,
      views: r.views,
      starts: r.starts,
      completions: r.completions,
    }));
  }

  /**
   * Get per-field drop-off data.
   */
  async getFieldDropoff(
    formId: string,
    creatorId: string,
  ): Promise<Array<{ fieldId: string; label: string; position: number; responseCount: number; retentionPercent: number }>> {
    const [form] = await db
      .select({ id: formsTable.id })
      .from(formsTable)
      .where(and(eq(formsTable.id, formId), eq(formsTable.creatorId, creatorId)))
      .limit(1);

    if (!form) return [];

    // Get fields
    const fields = await db
      .select()
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, formId))
      .orderBy(formFieldsTable.position);

    if (fields.length === 0) return [];

    // Count answers per field
    const answerCounts = await db
      .select({
        fieldId: responseAnswersTable.fieldId,
        count: sql<number>`count(distinct ${responseAnswersTable.responseId})::int`,
      })
      .from(responseAnswersTable)
      .innerJoin(responsesTable, eq(responseAnswersTable.responseId, responsesTable.id))
      .where(eq(responsesTable.formId, formId))
      .groupBy(responseAnswersTable.fieldId);

    const countMap = new Map(answerCounts.map((a) => [a.fieldId, a.count]));
    const totalResponses = Math.max(...answerCounts.map((a) => a.count), 1);

    return fields.map((f) => {
      const responseCount = countMap.get(f.id) ?? 0;
      return {
        fieldId: f.id,
        label: f.label,
        position: f.position,
        responseCount,
        retentionPercent: Math.round((responseCount / totalResponses) * 100),
      };
    });
  }

  /**
   * Get answer distribution for a specific field (e.g. role breakdown).
   */
  async getFieldDistribution(
    formId: string,
    fieldId: string,
    creatorId: string,
  ): Promise<Array<{ value: string; count: number; percent: number }>> {
    const [form] = await db
      .select({ id: formsTable.id })
      .from(formsTable)
      .where(and(eq(formsTable.id, formId), eq(formsTable.creatorId, creatorId)))
      .limit(1);

    if (!form) return [];

    const rows = await db
      .select({
        value: responseAnswersTable.value,
        count: sql<number>`count(*)::int`,
      })
      .from(responseAnswersTable)
      .innerJoin(responsesTable, eq(responseAnswersTable.responseId, responsesTable.id))
      .where(
        and(
          eq(responsesTable.formId, formId),
          eq(responseAnswersTable.fieldId, fieldId),
          sql`${responseAnswersTable.value} is not null AND ${responseAnswersTable.value} != ''`,
        ),
      )
      .groupBy(responseAnswersTable.value)
      .orderBy(desc(sql`count(*)`));

    const total = rows.reduce((sum, r) => sum + r.count, 0);

    return rows.map((r) => ({
      value: r.value ?? "Unknown",
      count: r.count,
      percent: total > 0 ? Math.round((r.count / total) * 100) : 0,
    }));
  }
}

export default AnalyticsService;
