import Redis from "ioredis";
import { logger } from "@repo/logger";
import { env } from "../env";

let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 200, 2000);
        return delay;
      },
      lazyConnect: true,
    });

    redisClient.on("connect", () => {
      logger.info("Redis connected");
    });

    redisClient.on("error", (err) => {
      logger.error("Redis connection error", { err: err.message });
    });

    redisClient.on("close", () => {
      logger.warn("Redis connection closed");
    });
  }

  return redisClient;
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    logger.info("Redis disconnected");
  }
}
