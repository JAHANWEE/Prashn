import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../../trpc";
import ResponseService from "@repo/services/response";

const responseService = new ResponseService();

const responseOutputSchema = z.object({
  id: z.string(),
  formId: z.string(),
  respondentEmail: z.string().nullable(),
  respondentName: z.string().nullable(),
  status: z.string(),
  startedAt: z.string(),
  completedAt: z.string().nullable(),
  durationSeconds: z.number().nullable(),
  metadata: z.unknown().nullable(),
  createdAt: z.string(),
});

function serializeResponse(r: any) {
  return {
    ...r,
    startedAt: r.startedAt.toISOString(),
    completedAt: r.completedAt?.toISOString() ?? null,
    createdAt: r.createdAt.toISOString(),
  };
}

export const responsesRouter = router({
  list: protectedProcedure
    .meta({ openapi: { method: "GET", path: "/forms/{formId}/responses", tags: ["Responses"] } })
    .input(
      z.object({
        formId: z.string().uuid(),
        status: z.enum(["completed", "abandoned", "in_progress"]).optional(),
        search: z.string().optional(),
        dateFrom: z.string().datetime().optional(),
        dateTo: z.string().datetime().optional(),
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(20),
        sortBy: z.enum(["created_at", "completed_at", "duration_seconds"]).default("created_at"),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
      }),
    )
    .output(
      z.object({
        responses: z.array(responseOutputSchema),
        total: z.number(),
        page: z.number(),
        limit: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { responses, total } = await responseService.list({
        formId: input.formId,
        creatorId: ctx.user.id,
        status: input.status,
        search: input.search,
        dateFrom: input.dateFrom ? new Date(input.dateFrom) : undefined,
        dateTo: input.dateTo ? new Date(input.dateTo) : undefined,
        page: input.page,
        limit: input.limit,
        sortBy: input.sortBy,
        sortOrder: input.sortOrder,
      });

      return {
        responses: responses.map(serializeResponse),
        total,
        page: input.page,
        limit: input.limit,
      };
    }),

  getById: protectedProcedure
    .meta({ openapi: { method: "GET", path: "/responses/{responseId}", tags: ["Responses"] } })
    .input(z.object({ responseId: z.string().uuid() }))
    .output(
      z.object({
        response: responseOutputSchema,
        answers: z.array(
          z.object({
            id: z.string(),
            fieldId: z.string(),
            value: z.string().nullable(),
            createdAt: z.string(),
          }),
        ),
      }),
    )
    .query(async ({ ctx, input }) => {
      const result = await responseService.getById(input.responseId, ctx.user.id);
      if (!result) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Response not found" });
      }

      return {
        response: serializeResponse(result.response),
        answers: result.answers.map((a) => ({
          id: a.id,
          fieldId: a.fieldId,
          value: a.value,
          createdAt: a.createdAt.toISOString(),
        })),
      };
    }),

  export: protectedProcedure
    .meta({ openapi: { method: "GET", path: "/forms/{formId}/responses/export", tags: ["Responses"] } })
    .input(z.object({ formId: z.string().uuid() }))
    .output(
      z.object({
        rows: z.array(z.record(z.string(), z.string())),
        filename: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const rows = await responseService.exportForCsv(input.formId, ctx.user.id);
      const timestamp = new Date().toISOString().split("T")[0];
      return {
        rows,
        filename: `responses-${input.formId.slice(0, 8)}-${timestamp}.csv`,
      };
    }),

  delete: protectedProcedure
    .meta({ openapi: { method: "DELETE", path: "/responses/{responseId}", tags: ["Responses"] } })
    .input(z.object({ responseId: z.string().uuid() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const deleted = await responseService.delete(input.responseId, ctx.user.id);
      if (!deleted) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Response not found" });
      }
      return { success: true };
    }),

  bulkDelete: protectedProcedure
    .meta({ openapi: { method: "POST", path: "/forms/{formId}/responses/bulk-delete", tags: ["Responses"] } })
    .input(
      z.object({
        formId: z.string().uuid(),
        responseIds: z.array(z.string().uuid()).min(1).max(100),
      }),
    )
    .output(z.object({ deleted: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const deleted = await responseService.bulkDelete(input.formId, ctx.user.id, input.responseIds);
      return { deleted };
    }),
});
