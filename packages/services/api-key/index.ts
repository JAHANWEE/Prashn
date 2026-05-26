import { createHash, randomBytes } from "node:crypto";
import { db, eq, and, isNull } from "@repo/database";
import { apiKeysTable, type SelectApiKey } from "@repo/database/schema";
import { logger } from "@repo/logger";

/**
 * Generate a random API key with a recognizable prefix.
 * Format: sk_live_<32 random hex chars>
 */
function generateRawKey(): string {
  const random = randomBytes(24).toString("hex");
  return `sk_live_${random}`;
}

/**
 * Hash an API key using SHA-256 for storage.
 */
function hashKey(rawKey: string): string {
  return createHash("sha256").update(rawKey).digest("hex");
}

/**
 * Extract the visible prefix from a raw key (first 12 chars + "...").
 */
function extractPrefix(rawKey: string): string {
  return rawKey.slice(0, 12);
}

class ApiKeyService {
  /**
   * List all API keys for a user (never returns the full key).
   */
  async list(userId: string): Promise<SelectApiKey[]> {
    return db
      .select()
      .from(apiKeysTable)
      .where(and(eq(apiKeysTable.userId, userId), isNull(apiKeysTable.revokedAt)))
      .orderBy(apiKeysTable.createdAt);
  }

  /**
   * Create a new API key. Returns the full raw key ONCE — it cannot be retrieved again.
   */
  async create(userId: string, name: string): Promise<{ key: SelectApiKey; rawKey: string }> {
    const rawKey = generateRawKey();
    const keyHash = hashKey(rawKey);
    const keyPrefix = extractPrefix(rawKey);

    const [key] = await db
      .insert(apiKeysTable)
      .values({
        userId,
        name,
        keyHash,
        keyPrefix,
      })
      .returning();

    logger.info("API key created", { keyId: key!.id, userId });
    return { key: key!, rawKey };
  }

  /**
   * Verify an API key and return the associated user ID.
   * Returns null if key is invalid, revoked, or expired.
   */
  async verify(rawKey: string): Promise<{ userId: string; keyId: string } | null> {
    const keyHash = hashKey(rawKey);

    const [key] = await db
      .select()
      .from(apiKeysTable)
      .where(and(eq(apiKeysTable.keyHash, keyHash), isNull(apiKeysTable.revokedAt)))
      .limit(1);

    if (!key) return null;

    // Check expiry
    if (key.expiresAt && new Date(key.expiresAt) < new Date()) {
      return null;
    }

    // Update last used timestamp (fire-and-forget)
    db.update(apiKeysTable)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiKeysTable.id, key.id))
      .then(() => {})
      .catch(() => {});

    return { userId: key.userId, keyId: key.id };
  }

  /**
   * Revoke an API key (soft delete — keeps record for audit).
   */
  async revoke(keyId: string, userId: string): Promise<boolean> {
    const [updated] = await db
      .update(apiKeysTable)
      .set({ revokedAt: new Date() })
      .where(and(eq(apiKeysTable.id, keyId), eq(apiKeysTable.userId, userId)))
      .returning();

    if (updated) {
      logger.info("API key revoked", { keyId, userId });
    }
    return !!updated;
  }

  /**
   * Permanently delete an API key.
   */
  async delete(keyId: string, userId: string): Promise<boolean> {
    const [existing] = await db
      .select({ id: apiKeysTable.id })
      .from(apiKeysTable)
      .where(and(eq(apiKeysTable.id, keyId), eq(apiKeysTable.userId, userId)))
      .limit(1);

    if (!existing) return false;

    await db.delete(apiKeysTable).where(eq(apiKeysTable.id, keyId));
    return true;
  }
}

export default ApiKeyService;
