import { z } from "zod";
import { publicProcedure, router } from "../../trpc";

export const healthRouter = router({
  getHealth: publicProcedure
    .meta({ openapi: { method: "GET", path: "/health" } })
    .input(z.void())
    .output(
      z.object({
        status: z.literal("healthy").describe("Status of the server"),
        timestamp: z.string().describe("Current server time"),
      }),
    )
    .query(async () => {
      return {
        status: "healthy" as const,
        timestamp: new Date().toISOString(),
      };
    }),
});
