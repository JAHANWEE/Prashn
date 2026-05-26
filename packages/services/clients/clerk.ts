import { createClerkClient, verifyToken } from "@clerk/backend";
import { logger } from "@repo/logger";
import { env } from "../env";

let clerkClient: ReturnType<typeof createClerkClient> | null = null;

export function getClerkClient() {
  if (!clerkClient) {
    if (!env.CLERK_SECRET_KEY) {
      throw new Error("CLERK_SECRET_KEY is not configured");
    }
    clerkClient = createClerkClient({ secretKey: env.CLERK_SECRET_KEY });
  }
  return clerkClient;
}

export interface ClerkTokenPayload {
  userId: string;
  email: string;
  fullName: string;
  imageUrl: string | null;
  emailVerified: boolean;
}

/**
 * Verify a Clerk JWT token and extract the user ID.
 * Does NOT call Clerk API on every request (fast path).
 * User details are resolved from our DB instead.
 */
export async function verifyClerkJwt(token: string): Promise<ClerkTokenPayload | null> {
  if (!env.CLERK_SECRET_KEY) {
    logger.warn("Clerk not configured — skipping JWT verification");
    return null;
  }

  try {
    const payload = await verifyToken(token, {
      secretKey: env.CLERK_SECRET_KEY,
    });

    if (!payload?.sub) {
      return null;
    }

    // Return minimal payload from JWT claims — no Clerk API call needed
    // The context will look up the full user from our DB
    return {
      userId: payload.sub,
      email: "", // Will be filled from DB
      fullName: "", // Will be filled from DB
      imageUrl: null,
      emailVerified: false,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("Clerk JWT verification failed", { error: message });
    return null;
  }
}
