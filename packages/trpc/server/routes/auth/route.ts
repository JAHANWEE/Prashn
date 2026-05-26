import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../../trpc";

export const authRouter = router({
  /**
   * Get the currently authenticated user's profile.
   * Returns null fields if not authenticated.
   */
  me: protectedProcedure
    .meta({ openapi: { method: "GET", path: "/auth/me" } })
    .input(z.void())
    .output(
      z.object({
        id: z.string(),
        email: z.string(),
        fullName: z.string(),
        profileImageUrl: z.string().nullable(),
        plan: z.string(),
        emailVerified: z.boolean(),
      }),
    )
    .query(async ({ ctx }) => {
      return {
        id: ctx.user.id,
        email: ctx.user.email,
        fullName: ctx.user.fullName,
        profileImageUrl: ctx.user.profileImageUrl,
        plan: ctx.user.plan,
        emailVerified: ctx.user.emailVerified,
      };
    }),
});
