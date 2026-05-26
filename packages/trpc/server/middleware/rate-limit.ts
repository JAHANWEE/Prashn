import { TRPCError } from "@trpc/server";
import { middleware } from "../trpc";
import {
  checkRateLimit,
  type RateLimitConfig,
  RATE_LIMITS,
} from "@repo/services/rate-limiter";

/**
 * Creates a rate-limiting middleware for tRPC procedures.
 *
 * @param config - Rate limit configuration (limit + windowMs)
 * @param identifierFn - Function to extract the identifier from context (defaults to IP)
 */
export function createRateLimitMiddleware(
  config: RateLimitConfig = RATE_LIMITS.GENERAL,
  endpoint: string = "general",
) {
  return middleware(async ({ ctx, next }) => {
    const identifier = ctx.user?.id ?? ctx.ip;

    const result = await checkRateLimit(identifier, endpoint, config);

    if (!result.allowed) {
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: `Rate limit exceeded. Try again in ${Math.ceil((result.resetAt.getTime() - Date.now()) / 1000)} seconds.`,
      });
    }

    return next({ ctx });
  });
}

/**
 * Pre-built rate limit middlewares for common use cases.
 */
export const rateLimitPublicSubmission = createRateLimitMiddleware(
  RATE_LIMITS.PUBLIC_SUBMISSION,
  "public_submission",
);

export const rateLimitApiKey = createRateLimitMiddleware(
  RATE_LIMITS.API_KEY,
  "api_key",
);

export const rateLimitAuth = createRateLimitMiddleware(
  RATE_LIMITS.AUTH,
  "auth",
);
