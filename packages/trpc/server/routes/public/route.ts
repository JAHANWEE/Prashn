import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "../../trpc";
import { rateLimitPublicSubmission } from "../../middleware/rate-limit";
import FormService from "@repo/services/form";
import FieldService from "@repo/services/field";
import ResponseService from "@repo/services/response";
import { db, eq, and, sql, like } from "@repo/database";
import { formsTable } from "@repo/database/schema";

const formService = new FormService();
const fieldService = new FieldService();
const responseService = new ResponseService();

export const publicRouter = router({
  /**
   * Get a published form by slug (for respondents).
   * Returns form + fields. Validates form is published and not expired.
   */
  getFormBySlug: publicProcedure
    .meta({ openapi: { method: "GET", path: "/public/forms/{slug}", tags: ["Public"] } })
    .input(z.object({ slug: z.string() }))
    .output(
      z.object({
        id: z.string(),
        title: z.string(),
        description: z.string().nullable(),
        slug: z.string(),
        settings: z.record(z.string(), z.unknown()),
        fields: z.array(
          z.object({
            id: z.string(),
            label: z.string(),
            description: z.string().nullable(),
            fieldType: z.string(),
            placeholder: z.string().nullable(),
            options: z.unknown().nullable(),
            validations: z.unknown().nullable(),
            required: z.boolean(),
            position: z.number(),
            page: z.number(),
          }),
        ),
      }),
    )
    .query(async ({ input }) => {
      const form = await formService.getBySlug(input.slug);

      if (!form) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
      }

      if (form.status !== "published") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "This form is not currently accepting responses.",
        });
      }

      // Check expiry
      if (form.expiresAt && new Date(form.expiresAt) < new Date()) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "This form has expired and is no longer accepting responses.",
        });
      }

      // Check response limit
      if (form.responseLimit) {
        const count = await formService.getResponseCount(form.id);
        if (count >= form.responseLimit) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "This form has reached its response limit.",
          });
        }
      }

      const fields = await fieldService.listByFormIdPublic(form.id);

      return {
        id: form.id,
        title: form.title,
        description: form.description,
        slug: form.slug,
        settings: (form.settings as Record<string, unknown>) ?? {},
        fields: fields.map((f) => ({
          id: f.id,
          label: f.label,
          description: f.description,
          fieldType: f.fieldType,
          placeholder: f.placeholder,
          options: f.options,
          validations: f.validations,
          required: f.required,
          position: f.position,
          page: f.page,
        })),
      };
    }),

  /**
   * Submit a response to a published form.
   * Rate limited: 60 req/min per IP.
   */
  submitResponse: publicProcedure
    .use(rateLimitPublicSubmission)
    .meta({ openapi: { method: "POST", path: "/public/forms/{slug}/responses", tags: ["Public"] } })
    .input(
      z.object({
        slug: z.string(),
        answers: z.array(
          z.object({
            fieldId: z.string().uuid(),
            value: z.string().nullable(),
          }),
        ),
        respondentEmail: z.string().email().optional(),
        respondentName: z.string().max(100).optional(),
      }),
    )
    .output(
      z.object({
        id: z.string(),
        message: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Resolve form
      const form = await formService.getBySlug(input.slug);

      if (!form) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
      }

      if (form.status !== "published") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "This form is not currently accepting responses.",
        });
      }

      // Check expiry
      if (form.expiresAt && new Date(form.expiresAt) < new Date()) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "This form has expired.",
        });
      }

      // Check response limit
      if (form.responseLimit) {
        const count = await formService.getResponseCount(form.id);
        if (count >= form.responseLimit) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "This form has reached its response limit.",
          });
        }
      }

      // Validate required fields
      const fields = await fieldService.listByFormIdPublic(form.id);
      const requiredFieldIds = fields.filter((f) => f.required).map((f) => f.id);
      const answeredFieldIds = input.answers.filter((a) => a.value !== null && a.value !== "").map((a) => a.fieldId);

      const missingRequired = requiredFieldIds.filter((id) => !answeredFieldIds.includes(id));
      if (missingRequired.length > 0) {
        const missingLabels = fields
          .filter((f) => missingRequired.includes(f.id))
          .map((f) => f.label);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Missing required fields: ${missingLabels.join(", ")}`,
        });
      }

      // Submit
      const response = await responseService.submit({
        formId: form.id,
        answers: input.answers,
        respondentEmail: input.respondentEmail,
        respondentName: input.respondentName,
        metadata: {
          ip: ctx.ip,
          userAgent: ctx.headers["user-agent"] as string | undefined,
          referrer: ctx.headers["referer"] as string | undefined,
          source: "web",
        },
      });

      return {
        id: response.id,
        message: "Response submitted successfully. Thank you!",
      };
    }),

  /**
   * List public + published forms (for explore/template pages).
   */
  listPublicForms: publicProcedure
    .meta({ openapi: { method: "GET", path: "/public/forms", tags: ["Public"] } })
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(50).default(12),
        search: z.string().optional(),
      }),
    )
    .output(
      z.object({
        forms: z.array(
          z.object({
            id: z.string(),
            title: z.string(),
            description: z.string().nullable(),
            slug: z.string(),
          }),
        ),
        total: z.number(),
      }),
    )
    .query(async ({ input }) => {
      const { page, limit, search } = input;
      const offset = (page - 1) * limit;

      const conditions = [
        eq(formsTable.status, "published"),
        eq(formsTable.visibility, "public"),
      ];

      if (search) {
        conditions.push(like(formsTable.title, `%${search}%`));
      }

      const where = and(...conditions);

      const [forms, countResult] = await Promise.all([
        db
          .select({
            id: formsTable.id,
            title: formsTable.title,
            description: formsTable.description,
            slug: formsTable.slug,
          })
          .from(formsTable)
          .where(where)
          .orderBy(formsTable.publishedAt)
          .limit(limit)
          .offset(offset),
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(formsTable)
          .where(where),
      ]);

      return { forms, total: countResult[0]?.count ?? 0 };
    }),

  /**
   * Record a form view (for analytics).
   */
  recordView: publicProcedure
    .meta({ openapi: { method: "POST", path: "/public/forms/{slug}/view", tags: ["Public"] } })
    .input(z.object({ slug: z.string() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ input }) => {
      const form = await formService.getBySlug(input.slug);
      if (!form || form.status !== "published") {
        return { success: false };
      }

      const today = new Date().toISOString().split("T")[0]!;
      await db
        .insert(formAnalyticsTable)
        .values({ formId: form.id, date: today, views: 1 })
        .onConflictDoUpdate({
          target: [formAnalyticsTable.formId, formAnalyticsTable.date],
          set: { views: sql`${formAnalyticsTable.views} + 1` },
        });

      return { success: true };
    }),
});
