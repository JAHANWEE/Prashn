/**
 * Quick integration test for the rate limiter.
 * Run: npx tsx rate-limiter/test.ts
 * Requires: Redis running on localhost:6379
 */
import { checkRateLimit, RATE_LIMITS, getRateLimitHeaders } from "./index";
import { disconnectRedis } from "../clients/redis";

async function main() {
  console.log("🧪 Testing rate limiter against local Redis...\n");

  const testIp = "127.0.0.1";
  const endpoint = "test_endpoint";
  const config = { limit: 5, windowMs: 10_000 }; // 5 requests per 10 seconds

  // Fire 7 requests — first 5 should pass, last 2 should be blocked
  for (let i = 1; i <= 7; i++) {
    const result = await checkRateLimit(testIp, endpoint, config);
    const headers = getRateLimitHeaders(result);
    console.log(
      `  Request ${i}: ${result.allowed ? "✅ ALLOWED" : "❌ BLOCKED"} | remaining=${result.remaining} | headers=${JSON.stringify(headers)}`,
    );
  }

  console.log("\n📋 Predefined rate limit tiers:");
  console.log("  PUBLIC_SUBMISSION:", RATE_LIMITS.PUBLIC_SUBMISSION);
  console.log("  API_KEY:", RATE_LIMITS.API_KEY);
  console.log("  AUTH:", RATE_LIMITS.AUTH);
  console.log("  GENERAL:", RATE_LIMITS.GENERAL);

  await disconnectRedis();
  console.log("\n✅ Rate limiter test complete!");
}

main().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
