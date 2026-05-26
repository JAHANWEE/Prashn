import { getRedisClient } from "../clients/redis";
import { logger } from "@repo/logger";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetAt: Date;
}

export interface RateLimitConfig {
  /** Max requests allowed in the window */
  limit: number;
  /** Window size in milliseconds */
  windowMs: number;
}

/**
 * Predefined rate limit tiers
 */
export const RATE_LIMITS = {
  /** Public form submission: 60 req/min per IP */
  PUBLIC_SUBMISSION: { limit: 60, windowMs: 60_000 },
  /** API key authenticated: 10,000 req/hour per key */
  API_KEY: { limit: 10_000, windowMs: 3_600_000 },
  /** Auth endpoints: 10 req/min per IP */
  AUTH: { limit: 10, windowMs: 60_000 },
  /** General authenticated: 1,000 req/min per user */
  GENERAL: { limit: 1_000, windowMs: 60_000 },
} as const;

/**
 * Lua script for atomic sliding window rate limiting.
 *
 * Uses a Redis sorted set where:
 * - Each member is a unique request ID (timestamp + random)
 * - Score is the timestamp of the request
 *
 * Operations (atomic):
 * 1. Remove all entries outside the current window
 * 2. Count remaining entries
 * 3. If under limit, add new entry
 * 4. Set TTL on the key to auto-cleanup
 *
 * Returns: [allowed (0|1), currentCount]
 */
const SLIDING_WINDOW_SCRIPT = `
local key = KEYS[1]
local now = tonumber(ARGV[1])
local window_ms = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])
local request_id = ARGV[4]

local window_start = now - window_ms

-- Remove expired entries
redis.call('ZREMRANGEBYSCORE', key, '-inf', window_start)

-- Count current entries in window
local current_count = redis.call('ZCARD', key)

if current_count < limit then
  -- Add new request
  redis.call('ZADD', key, now, request_id)
  -- Set TTL slightly longer than window to auto-cleanup
  redis.call('PEXPIRE', key, window_ms + 1000)
  return {1, current_count + 1}
else
  -- Set TTL even on rejection to ensure cleanup
  redis.call('PEXPIRE', key, window_ms + 1000)
  return {0, current_count}
end
`;

/**
 * Check rate limit for a given identifier and endpoint.
 *
 * @param identifier - IP address, API key, or user ID
 * @param endpoint - Endpoint category (e.g. "public_submission", "api_key")
 * @param config - Rate limit configuration
 * @returns RateLimitResult with allowed status and metadata
 */
export async function checkRateLimit(
  identifier: string,
  endpoint: string,
  config: RateLimitConfig,
): Promise<RateLimitResult> {
  const redis = getRedisClient();
  const key = `rl:${endpoint}:${identifier}`;
  const now = Date.now();
  const requestId = `${now}:${Math.random().toString(36).slice(2, 10)}`;

  try {
    const result = (await redis.eval(
      SLIDING_WINDOW_SCRIPT,
      1,
      key,
      now.toString(),
      config.windowMs.toString(),
      config.limit.toString(),
      requestId,
    )) as [number, number];

    const [allowed, currentCount] = result;
    const resetAt = new Date(now + config.windowMs);

    return {
      allowed: allowed === 1,
      remaining: Math.max(0, config.limit - currentCount),
      limit: config.limit,
      resetAt,
    };
  } catch (err) {
    // Graceful degradation: if Redis is down, allow the request but log warning
    logger.warn("Rate limiter Redis error — allowing request", {
      identifier,
      endpoint,
      error: err instanceof Error ? err.message : "unknown",
    });

    return {
      allowed: true,
      remaining: config.limit,
      limit: config.limit,
      resetAt: new Date(now + config.windowMs),
    };
  }
}

/**
 * Get rate limit headers for HTTP response.
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": result.limit.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": Math.ceil(result.resetAt.getTime() / 1000).toString(),
    ...(result.allowed ? {} : { "Retry-After": Math.ceil((result.resetAt.getTime() - Date.now()) / 1000).toString() }),
  };
}
