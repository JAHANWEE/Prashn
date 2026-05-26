import { initTRPC, TRPCError } from "@trpc/server";
import { OpenApiMeta } from "trpc-to-openapi";
import { ZodError } from "zod";

import type { Context } from "./context";

/**
 * tRPC initialization with:
 * - OpenAPI metadata support (for Scalar docs)
 * - Typed context (user, headers, ip)
 * - Custom error formatter (Zod field errors)
 */
const t = initTRPC
  .meta<OpenApiMeta>()
  .context<Context>()
  .create({
    errorFormatter({ shape, error }) {
      return {
        ...shape,
        data: {
          ...shape.data,
          zodError:
            error.cause instanceof ZodError ? error.cause.flatten() : null,
        },
      };
    },
  });

export const router = t.router;
export const middleware = t.middleware;

/**
 * Public procedure — no authentication required.
 * Used for: health checks, public form submission, explore page.
 */
export const publicProcedure = t.procedure;

/**
 * Auth middleware — ensures user is authenticated.
 * Throws UNAUTHORIZED if no valid user in context.
 */
const enforceAuth = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to perform this action.",
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user, // Now guaranteed non-null
    },
  });
});

/**
 * Protected procedure — requires authenticated user.
 * Used for: form CRUD, response management, analytics, settings.
 */
export const protectedProcedure = t.procedure.use(enforceAuth);
