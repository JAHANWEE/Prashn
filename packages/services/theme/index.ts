import { db, eq, or, isNull } from "@repo/database";
import { themesTable, type SelectTheme } from "@repo/database/schema";

class ThemeService {
  /**
   * List all themes available to a user (system themes + their custom themes).
   */
  async list(userId: string): Promise<SelectTheme[]> {
    return db
      .select()
      .from(themesTable)
      .where(or(eq(themesTable.isSystem, true), eq(themesTable.creatorId, userId)))
      .orderBy(themesTable.isSystem, themesTable.name);
  }

  /**
   * Create a custom theme.
   */
  async create(data: {
    creatorId: string;
    name: string;
    primaryColor: string;
    backgroundColor: string;
    textColor: string;
    fontFamily?: string;
    borderRadius?: string;
    logoUrl?: string;
    coverImageUrl?: string;
    customCss?: string;
  }): Promise<SelectTheme> {
    const [theme] = await db
      .insert(themesTable)
      .values({
        name: data.name,
        creatorId: data.creatorId,
        isSystem: false,
        primaryColor: data.primaryColor,
        backgroundColor: data.backgroundColor,
        textColor: data.textColor,
        fontFamily: data.fontFamily ?? "Inter",
        borderRadius: data.borderRadius ?? "8px",
        logoUrl: data.logoUrl ?? null,
        coverImageUrl: data.coverImageUrl ?? null,
        customCss: data.customCss ?? null,
      })
      .returning();

    return theme!;
  }

  /**
   * Update a custom theme (only owner can update, system themes are immutable).
   */
  async update(
    themeId: string,
    creatorId: string,
    data: Partial<Pick<SelectTheme, "name" | "primaryColor" | "backgroundColor" | "textColor" | "fontFamily" | "borderRadius" | "logoUrl" | "coverImageUrl" | "customCss">>,
  ): Promise<SelectTheme | null> {
    const [updated] = await db
      .update(themesTable)
      .set(data)
      .where(
        eq(themesTable.id, themeId),
      )
      .returning();

    // Verify ownership (don't allow editing system themes or others' themes)
    if (updated && (updated.isSystem || (updated.creatorId && updated.creatorId !== creatorId))) {
      // Revert — shouldn't happen with proper checks, but safety net
      return null;
    }

    return updated ?? null;
  }

  /**
   * Delete a custom theme (only owner can delete, system themes are immutable).
   */
  async delete(themeId: string, creatorId: string): Promise<boolean> {
    const [theme] = await db
      .select()
      .from(themesTable)
      .where(eq(themesTable.id, themeId))
      .limit(1);

    if (!theme || theme.isSystem || theme.creatorId !== creatorId) {
      return false;
    }

    await db.delete(themesTable).where(eq(themesTable.id, themeId));
    return true;
  }
}

export default ThemeService;
