import { Router, type Request, type Response } from "express";
import { Webhook } from "svix";
import { logger } from "@repo/logger";
import UserService from "@repo/services/user";

const router = Router();
const userService = new UserService();

interface ClerkWebhookEvent {
  type: string;
  data: {
    id: string;
    email_addresses: Array<{
      email_address: string;
      verification: { status: string } | null;
    }>;
    first_name: string | null;
    last_name: string | null;
    image_url: string | null;
  };
}

/**
 * POST /webhooks/clerk
 *
 * Handles Clerk webhook events:
 * - user.created → upsert user in our DB
 * - user.updated → upsert user in our DB
 * - user.deleted → delete user from our DB
 *
 * Verifies Svix signature to prevent spoofing.
 */
router.post("/clerk", async (req: Request, res: Response) => {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    logger.warn("CLERK_WEBHOOK_SECRET not configured — rejecting webhook");
    res.status(500).json({ error: "Webhook secret not configured" });
    return;
  }

  // Get Svix headers
  const svixId = req.headers["svix-id"] as string;
  const svixTimestamp = req.headers["svix-timestamp"] as string;
  const svixSignature = req.headers["svix-signature"] as string;

  if (!svixId || !svixTimestamp || !svixSignature) {
    logger.warn("Missing Svix headers on Clerk webhook");
    res.status(400).json({ error: "Missing webhook verification headers" });
    return;
  }

  // Verify signature
  const wh = new Webhook(webhookSecret);
  let event: ClerkWebhookEvent;

  try {
    const body = JSON.stringify(req.body);
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkWebhookEvent;
  } catch (err) {
    logger.error("Clerk webhook signature verification failed", {
      error: err instanceof Error ? err.message : "unknown",
    });
    res.status(401).json({ error: "Invalid webhook signature" });
    return;
  }

  // Handle events
  try {
    switch (event.type) {
      case "user.created":
      case "user.updated": {
        const { id, email_addresses, first_name, last_name, image_url } = event.data;
        const primaryEmail = email_addresses[0];

        await userService.upsertFromClerk({
          clerkId: id,
          email: primaryEmail?.email_address ?? "",
          fullName: `${first_name ?? ""} ${last_name ?? ""}`.trim() || "User",
          imageUrl: image_url ?? null,
          emailVerified: primaryEmail?.verification?.status === "verified",
        });

        logger.info(`Clerk webhook: ${event.type}`, { clerkId: id });
        break;
      }

      case "user.deleted": {
        await userService.deleteByClerkId(event.data.id);
        logger.info("Clerk webhook: user.deleted", { clerkId: event.data.id });
        break;
      }

      default:
        logger.debug(`Clerk webhook: unhandled event type "${event.type}"`);
    }

    res.status(200).json({ received: true });
  } catch (err) {
    logger.error("Clerk webhook handler error", {
      event: event.type,
      error: err instanceof Error ? err.message : "unknown",
    });
    res.status(500).json({ error: "Internal webhook processing error" });
  }
});

export const clerkWebhookRouter = router;
