import { z } from "zod";

const envSchema = z.object({
  PORT: z.string().optional(),
  NODE_ENV: z.enum(["development", "prod"]).default("development"),
  BASE_URL: z.string().default("http://localhost:8000"),

  // Clerk
  CLERK_SECRET_KEY: z.string().optional(),
  CLERK_WEBHOOK_SECRET: z.string().optional(),

  // Database
  DATABASE_URL: z.string().optional(),

  // Redis
  REDIS_URL: z.string().default("redis://localhost:6379"),
});

function createEnv(env: NodeJS.ProcessEnv) {
  const safeParseResult = envSchema.safeParse(env);
  if (!safeParseResult.success) {
    console.error("❌ Invalid environment variables:", safeParseResult.error.format());
    throw new Error("Invalid environment variables");
  }
  return safeParseResult.data;
}

export const env = createEnv(process.env);
