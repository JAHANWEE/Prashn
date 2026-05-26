import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { SelectUser } from "@repo/database/schema";
import { verifyClerkJwt, getClerkClient } from "@repo/services/clients/clerk";
import UserService from "@repo/services/user";
import { logger } from "@repo/logger";

const userService = new UserService();

export interface Context {
  user: SelectUser | null;
  headers: Record<string, string | string[] | undefined>;
  ip: string;
}

export async function createContext({ req }: CreateExpressContextOptions): Promise<Context> {
  const headers = req.headers;
  const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.ip || "unknown";

  const authHeader = headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { user: null, headers, ip };
  }

  const token = authHeader.slice(7);

  try {
    const clerkPayload = await verifyClerkJwt(token);
    if (!clerkPayload) {
      return { user: null, headers, ip };
    }

    // Fast path: look up user in our DB by Clerk ID
    let user = await userService.getByClerkId(clerkPayload.userId);

    // Slow path (first time only): user exists in Clerk but not in our DB
    if (!user) {
      try {
        const clerk = getClerkClient();
        const clerkUser = await clerk.users.getUser(clerkPayload.userId);
        user = await userService.upsertFromClerk({
          clerkId: clerkUser.id,
          email: clerkUser.emailAddresses[0]?.emailAddress ?? "unknown@user.com",
          fullName: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || "User",
          imageUrl: clerkUser.imageUrl ?? null,
          emailVerified: clerkUser.emailAddresses[0]?.verification?.status === "verified",
        });
      } catch (createErr) {
        logger.error("Failed to auto-create user from Clerk", {
          clerkId: clerkPayload.userId,
          error: createErr instanceof Error ? createErr.message : "unknown",
        });
        return { user: null, headers, ip };
      }
    }

    return { user, headers, ip };
  } catch (err) {
    logger.debug("Context auth failed (non-fatal)", {
      error: err instanceof Error ? err.message : "unknown",
    });
    return { user: null, headers, ip };
  }
}
