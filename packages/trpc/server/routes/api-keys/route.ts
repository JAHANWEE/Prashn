import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../../trpc";
import ApiKeyService from "@repo/services/api-key";

const apiKeyService = new ApiKeyService();

const apiKeyOutputSchema = z.object({
  id: z.string(),
  name: z.string(),
  keyPrefix: z.string(),
  lastUsedAt: z.string().nullable(),
  expiresAt: z.string().nullable(),
  revokedAt: z.string().nullable(),
  createdAt: z.string(),
});

function serializeKey(k: any) {
  return {
    id: k.id,
    name: k.name,
    keyPrefix: k.keyPrefix,
    lastUsedAt: k.lastUsedAt?.toISOString() ?? null,
    expiresAt: k.expiresAt?.toISOString() ?? null,
    revokedAt: k.revokedAt?.toISOString() ?? null,
    createdAt: k.createdAt.toISOString(),
  };
}

export const apiKeysRouter = router({
  list: protectedProcedure
    .meta({ openapi: { method: "GET", path: "/api-keys", tags: ["API Keys"] } })
    .input(z.void())
    .output(z.array(apiKeyOutputSchema))
    .query(async ({ ctx }) => {
      const keys = await apiKeyService.list(ctx.user.id);
      return keys.map(serializeKey);
    }),

  create: protectedProcedure
    .meta({ openapi: { method: "POST", path: "/api-keys", tags: ["API Keys"] } })
    .input(z.object({ name: z.string().min(1).max(100) }))
    .output(
      z.object({
        key: apiKeyOutputSchema,
        rawKey: z.string().describe("The full API key — shown only once. Store it securely."),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { key, rawKey } = await apiKeyService.create(ctx.user.id, input.name);
      return { key: serializeKey(key), rawKey };
    }),

  revoke: protectedProcedure
    .meta({ openapi: { method: "POST", path: "/api-keys/{keyId}/revoke", tags: ["API Keys"] } })
    .input(z.object({ keyId: z.string().uuid() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const revoked = await apiKeyService.revoke(input.keyId, ctx.user.id);
      if (!revoked) {
        throw new TRPCError({ code: "NOT_FOUND", message: "API key not found" });
      }
      return { success: true };
    }),

  delete: protectedProcedure
    .meta({ openapi: { method: "DELETE", path: "/api-keys/{keyId}", tags: ["API Keys"] } })
    .input(z.object({ keyId: z.string().uuid() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const deleted = await apiKeyService.delete(input.keyId, ctx.user.id);
      if (!deleted) {
        throw new TRPCError({ code: "NOT_FOUND", message: "API key not found" });
      }
      return { success: true };
    }),
});
