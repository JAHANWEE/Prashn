import { db, eq } from "@repo/database";
import { usersTable, type SelectUser, type InsertUser } from "@repo/database/schema";
import { logger } from "@repo/logger";

class UserService {
  /**
   * Upsert a user from Clerk webhook data.
   * Called on user.created and user.updated events.
   */
  async upsertFromClerk(data: {
    clerkId: string;
    email: string;
    fullName: string;
    imageUrl: string | null;
    emailVerified: boolean;
  }): Promise<SelectUser> {
    const existing = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.clerkId, data.clerkId))
      .limit(1);

    if (existing.length > 0) {
      const [updated] = await db
        .update(usersTable)
        .set({
          email: data.email,
          fullName: data.fullName,
          profileImageUrl: data.imageUrl,
          emailVerified: data.emailVerified,
        })
        .where(eq(usersTable.clerkId, data.clerkId))
        .returning();

      logger.info("User updated from Clerk", { clerkId: data.clerkId });
      return updated!;
    }

    const [created] = await db
      .insert(usersTable)
      .values({
        clerkId: data.clerkId,
        email: data.email,
        fullName: data.fullName,
        profileImageUrl: data.imageUrl,
        emailVerified: data.emailVerified,
      })
      .returning();

    logger.info("User created from Clerk", { clerkId: data.clerkId });
    return created!;
  }

  /**
   * Get user by Clerk ID. Used in tRPC context to resolve the authenticated user.
   */
  async getByClerkId(clerkId: string): Promise<SelectUser | null> {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.clerkId, clerkId))
      .limit(1);

    return user ?? null;
  }

  /**
   * Get user by internal UUID.
   */
  async getById(id: string): Promise<SelectUser | null> {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .limit(1);

    return user ?? null;
  }

  /**
   * Delete user (called on Clerk user.deleted webhook).
   */
  async deleteByClerkId(clerkId: string): Promise<void> {
    await db.delete(usersTable).where(eq(usersTable.clerkId, clerkId));
    logger.info("User deleted from Clerk webhook", { clerkId });
  }

  /**
   * Update user plan.
   */
  async updatePlan(userId: string, plan: "free" | "pro" | "team"): Promise<SelectUser | null> {
    const [updated] = await db
      .update(usersTable)
      .set({ plan })
      .where(eq(usersTable.id, userId))
      .returning();

    return updated ?? null;
  }
}

export default UserService;
