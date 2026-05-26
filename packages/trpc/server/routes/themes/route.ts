import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../../trpc";
import ThemeService from "@repo/services/theme";

const themeService = new ThemeService();

const hexColorRegex = /^#[0-9a-fA-F]{6}$/;

const themeOutputSchema = z.object({
  id: z.string(),
  name: z.string(),
  creatorId: z.string().nullable(),
  isSystem: z.boolean(),
  primaryColor: z.string(),
  backgroundColor: z.string(),
  textColor: z.string(),
  fontFamily: z.string(),
  borderRadius: z.string(),
  logoUrl: z.string().nullable(),
  coverImageUrl: z.string().nullable(),
  customCss: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

function serializeTheme(t: any) {
  return {
    ...t,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  };
}

export const themesRouter = router({
  list: protectedProcedure
    .meta({ openapi: { method: "GET", path: "/themes", tags: ["Themes"] } })
    .input(z.void())
    .output(z.array(themeOutputSchema))
    .query(async ({ ctx }) => {
      const themes = await themeService.list(ctx.user.id);
      return themes.map(serializeTheme);
    }),

  create: protectedProcedure
    .meta({ openapi: { method: "POST", path: "/themes", tags: ["Themes"] } })
    .input(
      z.object({
        name: z.string().min(1).max(100),
        primaryColor: z.string().regex(hexColorRegex, "Must be a valid hex color (#RRGGBB)"),
        backgroundColor: z.string().regex(hexColorRegex, "Must be a valid hex color"),
        textColor: z.string().regex(hexColorRegex, "Must be a valid hex color"),
        fontFamily: z.string().max(50).optional(),
        borderRadius: z.string().max(10).optional(),
        logoUrl: z.string().url().optional(),
        coverImageUrl: z.string().url().optional(),
        customCss: z.string().max(5000).optional(),
      }),
    )
    .output(themeOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const theme = await themeService.create({ creatorId: ctx.user.id, ...input });
      return serializeTheme(theme);
    }),

  update: protectedProcedure
    .meta({ openapi: { method: "PATCH", path: "/themes/{themeId}", tags: ["Themes"] } })
    .input(
      z.object({
        themeId: z.string().uuid(),
        name: z.string().min(1).max(100).optional(),
        primaryColor: z.string().regex(hexColorRegex).optional(),
        backgroundColor: z.string().regex(hexColorRegex).optional(),
        textColor: z.string().regex(hexColorRegex).optional(),
        fontFamily: z.string().max(50).optional(),
        borderRadius: z.string().max(10).optional(),
        logoUrl: z.string().url().nullable().optional(),
        coverImageUrl: z.string().url().nullable().optional(),
        customCss: z.string().max(5000).nullable().optional(),
      }),
    )
    .output(themeOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const { themeId, ...data } = input;
      const theme = await themeService.update(themeId, ctx.user.id, data);
      if (!theme) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Theme not found or cannot be edited" });
      }
      return serializeTheme(theme);
    }),

  delete: protectedProcedure
    .meta({ openapi: { method: "DELETE", path: "/themes/{themeId}", tags: ["Themes"] } })
    .input(z.object({ themeId: z.string().uuid() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const deleted = await themeService.delete(input.themeId, ctx.user.id);
      if (!deleted) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Theme not found or cannot be deleted" });
      }
      return { success: true };
    }),
});
