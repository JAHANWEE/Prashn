import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../../trpc";
import FieldService, { FIELD_TYPES } from "@repo/services/field";

const fieldService = new FieldService();

const fieldTypeEnum = z.enum(FIELD_TYPES);

const fieldOutputSchema = z.object({
  id: z.string(),
  formId: z.string(),
  label: z.string(),
  description: z.string().nullable(),
  fieldType: z.string(),
  placeholder: z.string().nullable(),
  options: z.unknown().nullable(),
  validations: z.unknown().nullable(),
  required: z.boolean(),
  position: z.number(),
  page: z.number(),
  conditionalLogic: z.unknown().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

function serializeField(field: any) {
  return {
    ...field,
    createdAt: field.createdAt.toISOString(),
    updatedAt: field.updatedAt.toISOString(),
  };
}

export const fieldsRouter = router({
  create: protectedProcedure
    .meta({ openapi: { method: "POST", path: "/forms/{formId}/fields", tags: ["Fields"] } })
    .input(
      z.object({
        formId: z.string().uuid(),
        label: z.string().min(1).max(500),
        description: z.string().max(2000).optional(),
        fieldType: fieldTypeEnum,
        placeholder: z.string().max(500).optional(),
        options: z
          .array(z.object({ label: z.string(), value: z.string() }))
          .optional(),
        validations: z
          .object({
            min: z.number().optional(),
            max: z.number().optional(),
            minLength: z.number().optional(),
            maxLength: z.number().optional(),
            pattern: z.string().optional(),
            customMessage: z.string().optional(),
          })
          .optional(),
        required: z.boolean().optional(),
        page: z.number().int().min(1).optional(),
        conditionalLogic: z
          .object({
            showIf: z.object({
              fieldId: z.string().uuid(),
              operator: z.enum(["equals", "not_equals", "contains", "greater_than", "less_than"]),
              value: z.string(),
            }),
          })
          .optional(),
      }),
    )
    .output(fieldOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const field = await fieldService.create({
        formId: input.formId,
        creatorId: ctx.user.id,
        label: input.label,
        description: input.description,
        fieldType: input.fieldType,
        placeholder: input.placeholder,
        options: input.options,
        validations: input.validations,
        required: input.required,
        page: input.page,
        conditionalLogic: input.conditionalLogic,
      });

      if (!field) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Form not found or access denied" });
      }

      return serializeField(field);
    }),

  list: protectedProcedure
    .meta({ openapi: { method: "GET", path: "/forms/{formId}/fields", tags: ["Fields"] } })
    .input(z.object({ formId: z.string().uuid() }))
    .output(z.array(fieldOutputSchema))
    .query(async ({ ctx, input }) => {
      const fields = await fieldService.listByFormId(input.formId, ctx.user.id);
      return fields.map(serializeField);
    }),

  update: protectedProcedure
    .meta({ openapi: { method: "PATCH", path: "/fields/{fieldId}", tags: ["Fields"] } })
    .input(
      z.object({
        fieldId: z.string().uuid(),
        label: z.string().min(1).max(500).optional(),
        description: z.string().max(2000).nullable().optional(),
        fieldType: fieldTypeEnum.optional(),
        placeholder: z.string().max(500).nullable().optional(),
        options: z
          .array(z.object({ label: z.string(), value: z.string() }))
          .nullable()
          .optional(),
        validations: z
          .object({
            min: z.number().optional(),
            max: z.number().optional(),
            minLength: z.number().optional(),
            maxLength: z.number().optional(),
            pattern: z.string().optional(),
            customMessage: z.string().optional(),
          })
          .nullable()
          .optional(),
        required: z.boolean().optional(),
        page: z.number().int().min(1).optional(),
        conditionalLogic: z
          .object({
            showIf: z.object({
              fieldId: z.string().uuid(),
              operator: z.enum(["equals", "not_equals", "contains", "greater_than", "less_than"]),
              value: z.string(),
            }),
          })
          .nullable()
          .optional(),
      }),
    )
    .output(fieldOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const { fieldId, ...data } = input;
      const field = await fieldService.update(fieldId, ctx.user.id, data as any);

      if (!field) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Field not found or access denied" });
      }

      return serializeField(field);
    }),

  delete: protectedProcedure
    .meta({ openapi: { method: "DELETE", path: "/fields/{fieldId}", tags: ["Fields"] } })
    .input(z.object({ fieldId: z.string().uuid() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const deleted = await fieldService.delete(input.fieldId, ctx.user.id);
      if (!deleted) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Field not found or access denied" });
      }
      return { success: true };
    }),

  reorder: protectedProcedure
    .meta({ openapi: { method: "POST", path: "/forms/{formId}/fields/reorder", tags: ["Fields"] } })
    .input(
      z.object({
        formId: z.string().uuid(),
        order: z.array(
          z.object({
            fieldId: z.string().uuid(),
            position: z.number().int().min(1),
          }),
        ),
      }),
    )
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const success = await fieldService.reorder(input.formId, ctx.user.id, input.order);
      if (!success) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Form not found or access denied" });
      }
      return { success: true };
    }),
});
