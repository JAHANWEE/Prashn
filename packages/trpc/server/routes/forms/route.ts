import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, protectedProcedure, router } from "../../trpc";
import FormService from "@repo/services/form";

const formService = new FormService();

const formOutputSchema = z.object({
  id: z.string(),
  creatorId: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  slug: z.string(),
  status: z.string(),
  visibility: z.string(),
  themeId: z.string().nullable(),
  settings: z.record(z.string(), z.unknown()),
  expiresAt: z.string().nullable(),
  responseLimit: z.number().nullable(),
  publishedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

function serializeForm(form: any) {
  return {
    ...form,
    expiresAt: form.expiresAt?.toISOString() ?? null,
    publishedAt: form.publishedAt?.toISOString() ?? null,
    createdAt: form.createdAt.toISOString(),
    updatedAt: form.updatedAt.toISOString(),
  };
}

export const formsRouter = router({
  create: protectedProcedure
    .meta({ openapi: { method: "POST", path: "/forms", tags: ["Forms"] } })
    .input(
      z.object({
        title: z.string().min(1).max(255),
        description: z.string().max(2000).optional(),
      }),
    )
    .output(formOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const form = await formService.create({
        creatorId: ctx.user.id,
        title: input.title,
        description: input.description,
      });
      return serializeForm(form);
    }),

  list: protectedProcedure
    .meta({ openapi: { method: "GET", path: "/forms", tags: ["Forms"] } })
    .input(
      z.object({
        status: z.enum(["draft", "published", "unpublished", "archived"]).optional(),
        search: z.string().optional(),
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(20),
      }),
    )
    .output(
      z.object({
        forms: z.array(formOutputSchema),
        total: z.number(),
        page: z.number(),
        limit: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { forms, total } = await formService.list({
        creatorId: ctx.user.id,
        status: input.status,
        search: input.search,
        page: input.page,
        limit: input.limit,
      });
      return {
        forms: forms.map(serializeForm),
        total,
        page: input.page,
        limit: input.limit,
      };
    }),

  getById: protectedProcedure
    .meta({ openapi: { method: "GET", path: "/forms/{formId}", tags: ["Forms"] } })
    .input(z.object({ formId: z.string().uuid() }))
    .output(formOutputSchema)
    .query(async ({ ctx, input }) => {
      const form = await formService.getById(input.formId, ctx.user.id);
      if (!form) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
      }
      return serializeForm(form);
    }),

  update: protectedProcedure
    .meta({ openapi: { method: "PATCH", path: "/forms/{formId}", tags: ["Forms"] } })
    .input(
      z.object({
        formId: z.string().uuid(),
        title: z.string().min(1).max(255).optional(),
        description: z.string().max(2000).nullable().optional(),
        settings: z.record(z.string(), z.unknown()).optional(),
        themeId: z.string().uuid().nullable().optional(),
        expiresAt: z.string().datetime().nullable().optional(),
        responseLimit: z.number().int().min(1).nullable().optional(),
      }),
    )
    .output(formOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const { formId, ...data } = input;
      const updateData: any = { ...data };
      if (data.expiresAt !== undefined) {
        updateData.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;
      }
      const form = await formService.update(formId, ctx.user.id, updateData);
      if (!form) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
      }
      return serializeForm(form);
    }),

  publish: protectedProcedure
    .meta({ openapi: { method: "POST", path: "/forms/{formId}/publish", tags: ["Forms"] } })
    .input(z.object({ formId: z.string().uuid() }))
    .output(formOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const form = await formService.publish(input.formId, ctx.user.id);
      if (!form) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
      }
      return serializeForm(form);
    }),

  unpublish: protectedProcedure
    .meta({ openapi: { method: "POST", path: "/forms/{formId}/unpublish", tags: ["Forms"] } })
    .input(z.object({ formId: z.string().uuid() }))
    .output(formOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const form = await formService.unpublish(input.formId, ctx.user.id);
      if (!form) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
      }
      return serializeForm(form);
    }),

  archive: protectedProcedure
    .meta({ openapi: { method: "POST", path: "/forms/{formId}/archive", tags: ["Forms"] } })
    .input(z.object({ formId: z.string().uuid() }))
    .output(formOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const form = await formService.archive(input.formId, ctx.user.id);
      if (!form) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
      }
      return serializeForm(form);
    }),

  unarchive: protectedProcedure
    .meta({ openapi: { method: "POST", path: "/forms/{formId}/unarchive", tags: ["Forms"] } })
    .input(z.object({ formId: z.string().uuid() }))
    .output(formOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const form = await formService.unarchive(input.formId, ctx.user.id);
      if (!form) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
      }
      return serializeForm(form);
    }),

  updateVisibility: protectedProcedure
    .meta({ openapi: { method: "PATCH", path: "/forms/{formId}/visibility", tags: ["Forms"] } })
    .input(
      z.object({
        formId: z.string().uuid(),
        visibility: z.enum(["public", "unlisted"]),
      }),
    )
    .output(formOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const form = await formService.updateVisibility(input.formId, ctx.user.id, input.visibility);
      if (!form) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
      }
      return serializeForm(form);
    }),

  clone: protectedProcedure
    .meta({ openapi: { method: "POST", path: "/forms/{formId}/clone", tags: ["Forms"] } })
    .input(z.object({ formId: z.string().uuid() }))
    .output(formOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const form = await formService.clone(input.formId, ctx.user.id);
      if (!form) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Form not found or clone failed" });
      }
      return serializeForm(form);
    }),

  delete: protectedProcedure
    .meta({ openapi: { method: "DELETE", path: "/forms/{formId}", tags: ["Forms"] } })
    .input(z.object({ formId: z.string().uuid() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      await formService.delete(input.formId, ctx.user.id);
      return { success: true };
    }),
});
