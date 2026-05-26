import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../../trpc";
import AnalyticsService from "@repo/services/analytics";

const analyticsService = new AnalyticsService();

export const analyticsRouter = router({
  overview: protectedProcedure
    .meta({ openapi: { method: "GET", path: "/forms/{formId}/analytics/overview", tags: ["Analytics"] } })
    .input(z.object({ formId: z.string().uuid() }))
    .output(
      z.object({
        totalResponses: z.number(),
        completionRate: z.number(),
        avgDurationSeconds: z.number(),
        totalViews: z.number(),
        totalStarts: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const overview = await analyticsService.getOverview(input.formId, ctx.user.id);
      if (!overview) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
      }
      return overview;
    }),

  timeline: protectedProcedure
    .meta({ openapi: { method: "GET", path: "/forms/{formId}/analytics/timeline", tags: ["Analytics"] } })
    .input(
      z.object({
        formId: z.string().uuid(),
        days: z.number().int().min(1).max(90).default(7),
      }),
    )
    .output(
      z.array(
        z.object({
          date: z.string(),
          views: z.number(),
          starts: z.number(),
          completions: z.number(),
        }),
      ),
    )
    .query(async ({ ctx, input }) => {
      return analyticsService.getTimeline(input.formId, ctx.user.id, input.days);
    }),

  fieldDropoff: protectedProcedure
    .meta({ openapi: { method: "GET", path: "/forms/{formId}/analytics/dropoff", tags: ["Analytics"] } })
    .input(z.object({ formId: z.string().uuid() }))
    .output(
      z.array(
        z.object({
          fieldId: z.string(),
          label: z.string(),
          position: z.number(),
          responseCount: z.number(),
          retentionPercent: z.number(),
        }),
      ),
    )
    .query(async ({ ctx, input }) => {
      return analyticsService.getFieldDropoff(input.formId, ctx.user.id);
    }),

  fieldDistribution: protectedProcedure
    .meta({ openapi: { method: "GET", path: "/forms/{formId}/analytics/distribution/{fieldId}", tags: ["Analytics"] } })
    .input(
      z.object({
        formId: z.string().uuid(),
        fieldId: z.string().uuid(),
      }),
    )
    .output(
      z.array(
        z.object({
          value: z.string(),
          count: z.number(),
          percent: z.number(),
        }),
      ),
    )
    .query(async ({ ctx, input }) => {
      return analyticsService.getFieldDistribution(input.formId, input.fieldId, ctx.user.id);
    }),
});
