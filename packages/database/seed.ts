/**
 * CanvasForms — Seed Script
 *
 * Creates demo data for judges/reviewers:
 * - 1 demo user (admin@canvasforms.io)
 * - 4 system themes
 * - 3 themed forms with fields
 * - 700+ randomized responses
 * - 30 days of analytics data
 * - 1 API key
 *
 * Usage:
 *   DATABASE_URL="postgresql://canvasforms:canvasforms@localhost:5432/canvasforms" npx tsx seed.ts
 */
import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import { createHash, randomBytes } from "node:crypto";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL not set");
  process.exit(1);
}

const db = drizzle(DATABASE_URL);

// ─── Helpers ───────────────────────────────────────────────────────────────────

function uuid(): string {
  return crypto.randomUUID();
}

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function dateStr(d: Date): string {
  return d.toISOString().split("T")[0]!;
}

// ─── IDs ───────────────────────────────────────────────────────────────────────

const DEMO_USER_ID = uuid();
const THEME_IDS = { indigo: uuid(), sunset: uuid(), forest: uuid(), midnight: uuid() };
const FORM_IDS = { startup: uuid(), anime: uuid(), gamedev: uuid() };

// ─── Seed Functions ────────────────────────────────────────────────────────────

async function seedUser() {
  console.log("👤 Seeding demo user...");
  await db.execute(sql`
    INSERT INTO users (id, clerk_id, full_name, email, email_verified, plan)
    VALUES (${DEMO_USER_ID}, 'user_demo_canvasforms', 'Alex Rivera', 'admin@canvasforms.io', true, 'pro')
    ON CONFLICT (clerk_id) DO UPDATE SET full_name = 'Alex Rivera', plan = 'pro'
  `);
}

async function seedThemes() {
  console.log("🎨 Seeding system themes...");
  const themes = [
    { id: THEME_IDS.indigo, name: "Dark Indigo", primary: "#818cf8", bg: "#121319", text: "#e4e1eb" },
    { id: THEME_IDS.sunset, name: "Sunset Orange", primary: "#f97316", bg: "#1a1008", text: "#fef3e2" },
    { id: THEME_IDS.forest, name: "Forest Green", primary: "#22c55e", bg: "#0a1a0f", text: "#e8f5e9" },
    { id: THEME_IDS.midnight, name: "Midnight Blue", primary: "#3b82f6", bg: "#0c1222", text: "#e0ecff" },
  ];

  for (const t of themes) {
    await db.execute(sql`
      INSERT INTO themes (id, name, creator_id, is_system, primary_color, background_color, text_color, font_family, border_radius)
      VALUES (${t.id}, ${t.name}, NULL, true, ${t.primary}, ${t.bg}, ${t.text}, 'Inter', '8px')
      ON CONFLICT DO NOTHING
    `);
  }
}

async function seedForms() {
  console.log("📝 Seeding forms...");

  // Form 1: Startup Feedback Flow (public, published)
  await db.execute(sql`
    INSERT INTO forms (id, creator_id, title, description, slug, status, visibility, theme_id, settings, published_at)
    VALUES (
      ${FORM_IDS.startup}, ${DEMO_USER_ID},
      'Startup Feedback Flow',
      'A comprehensive logic-driven survey for early-stage customer discovery and feedback.',
      'startup-feedback-flow',
      'published', 'public', ${THEME_IDS.indigo},
      '{"show_progress_bar": true, "confirmation_message": "Thank you for your feedback!"}'::jsonb,
      ${daysAgo(14).toISOString()}
    ) ON CONFLICT (slug) DO NOTHING
  `);

  // Form 2: Anime Convention RSVP (public, published)
  await db.execute(sql`
    INSERT INTO forms (id, creator_id, title, description, slug, status, visibility, theme_id, settings, published_at)
    VALUES (
      ${FORM_IDS.anime}, ${DEMO_USER_ID},
      'Anime Convention RSVP',
      'Register for AniExpo 2025 — cosplay contests, panels, and exclusive screenings.',
      'anime-convention-rsvp',
      'published', 'public', ${THEME_IDS.sunset},
      '{"show_progress_bar": true, "confirmation_message": "See you at AniExpo!"}'::jsonb,
      ${daysAgo(7).toISOString()}
    ) ON CONFLICT (slug) DO NOTHING
  `);

  // Form 3: Game Dev Survey (unlisted, published)
  await db.execute(sql`
    INSERT INTO forms (id, creator_id, title, description, slug, status, visibility, theme_id, settings, published_at)
    VALUES (
      ${FORM_IDS.gamedev}, ${DEMO_USER_ID},
      'Game Dev Community Survey',
      'Help us understand what tools and engines indie game developers prefer.',
      'gamedev-community-survey',
      'published', 'unlisted', ${THEME_IDS.midnight},
      '{"show_progress_bar": true}'::jsonb,
      ${daysAgo(21).toISOString()}
    ) ON CONFLICT (slug) DO NOTHING
  `);
}

async function seedFields() {
  console.log("📋 Seeding form fields...");

  // Startup Feedback Flow fields
  const startupFields = [
    { label: "Your Name", type: "short_text", required: true, placeholder: "John Doe" },
    { label: "Email Address", type: "email", required: true, placeholder: "you@company.com" },
    { label: "Your Role", type: "single_select", required: true, options: [{ label: "Founder", value: "founder" }, { label: "Engineer", value: "engineer" }, { label: "Designer", value: "designer" }, { label: "Product Manager", value: "pm" }] },
    { label: "How did you hear about us?", type: "single_select", required: false, options: [{ label: "Twitter/X", value: "twitter" }, { label: "Product Hunt", value: "producthunt" }, { label: "Friend", value: "friend" }, { label: "Google", value: "google" }] },
    { label: "Rate your experience", type: "rating", required: true },
    { label: "What could we improve?", type: "long_text", required: false, placeholder: "Tell us what you think..." },
    { label: "Would you recommend us?", type: "checkbox", required: false },
  ];

  for (let i = 0; i < startupFields.length; i++) {
    const f = startupFields[i]!;
    await db.execute(sql`
      INSERT INTO form_fields (id, form_id, label, field_type, required, position, placeholder, options)
      VALUES (${uuid()}, ${FORM_IDS.startup}, ${f.label}, ${f.type}, ${f.required}, ${i + 1}, ${f.placeholder ?? null}, ${f.options ? JSON.stringify(f.options) : null}::jsonb)
    `);
  }

  // Anime Convention RSVP fields
  const animeFields = [
    { label: "Full Name", type: "short_text", required: true },
    { label: "Email", type: "email", required: true },
    { label: "Favorite Anime Genre", type: "single_select", required: true, options: [{ label: "Shonen", value: "shonen" }, { label: "Seinen", value: "seinen" }, { label: "Isekai", value: "isekai" }, { label: "Slice of Life", value: "sol" }, { label: "Mecha", value: "mecha" }] },
    { label: "Will you cosplay?", type: "checkbox", required: false },
    { label: "Dietary Preferences", type: "multi_select", required: false, options: [{ label: "Vegetarian", value: "veg" }, { label: "Vegan", value: "vegan" }, { label: "Gluten-free", value: "gf" }, { label: "No restrictions", value: "none" }] },
  ];

  for (let i = 0; i < animeFields.length; i++) {
    const f = animeFields[i]!;
    await db.execute(sql`
      INSERT INTO form_fields (id, form_id, label, field_type, required, position, options)
      VALUES (${uuid()}, ${FORM_IDS.anime}, ${f.label}, ${f.type}, ${f.required}, ${i + 1}, ${f.options ? JSON.stringify(f.options) : null}::jsonb)
    `);
  }

  // Game Dev Survey fields
  const gamedevFields = [
    { label: "Name / Handle", type: "short_text", required: true },
    { label: "Email", type: "email", required: false },
    { label: "Primary Game Engine", type: "single_select", required: true, options: [{ label: "Unity", value: "unity" }, { label: "Unreal Engine", value: "unreal" }, { label: "Godot", value: "godot" }, { label: "GameMaker", value: "gamemaker" }, { label: "Custom", value: "custom" }] },
    { label: "Years of Experience", type: "number", required: true },
    { label: "Team Size", type: "single_select", required: true, options: [{ label: "Solo", value: "solo" }, { label: "2-5", value: "small" }, { label: "6-20", value: "medium" }, { label: "20+", value: "large" }] },
    { label: "Primary Platform", type: "multi_select", required: true, options: [{ label: "PC/Steam", value: "pc" }, { label: "Console", value: "console" }, { label: "Mobile", value: "mobile" }, { label: "Web/Browser", value: "web" }] },
    { label: "Biggest Challenge", type: "long_text", required: false },
    { label: "Rate the indie dev ecosystem", type: "rating", required: true },
    { label: "Preferred Art Style", type: "single_select", required: false, options: [{ label: "Pixel Art", value: "pixel" }, { label: "3D Realistic", value: "3d" }, { label: "Low Poly", value: "lowpoly" }, { label: "Hand-drawn", value: "handdrawn" }] },
    { label: "Open to collaboration?", type: "checkbox", required: false },
  ];

  for (let i = 0; i < gamedevFields.length; i++) {
    const f = gamedevFields[i]!;
    await db.execute(sql`
      INSERT INTO form_fields (id, form_id, label, field_type, required, position, options)
      VALUES (${uuid()}, ${FORM_IDS.gamedev}, ${f.label}, ${f.type}, ${f.required}, ${i + 1}, ${f.options ? JSON.stringify(f.options) : null}::jsonb)
    `);
  }
}

async function seedResponses() {
  console.log("📊 Seeding responses (this may take a moment)...");

  const names = ["Alice Chen", "Bob Smith", "Charlie Kim", "Diana Patel", "Eve Johnson", "Frank Lee", "Grace Wang", "Henry Brown", "Iris Tanaka", "Jack Wilson", "Kira Novak", "Leo Martinez", "Mia Thompson", "Noah Garcia", "Olivia Davis"];
  const domains = ["gmail.com", "outlook.com", "company.co", "startup.io", "dev.org"];

  // Get fields for each form
  const startupFieldRows = await db.execute(sql`SELECT id, field_type, options FROM form_fields WHERE form_id = ${FORM_IDS.startup} ORDER BY position`);
  const animeFieldRows = await db.execute(sql`SELECT id, field_type, options FROM form_fields WHERE form_id = ${FORM_IDS.anime} ORDER BY position`);
  const gamedevFieldRows = await db.execute(sql`SELECT id, field_type, options FROM form_fields WHERE form_id = ${FORM_IDS.gamedev} ORDER BY position`);

  function generateAnswer(fieldType: string, options: any): string {
    switch (fieldType) {
      case "short_text": return randomFrom(names);
      case "email": return `${randomFrom(names).toLowerCase().replace(" ", ".")}@${randomFrom(domains)}`;
      case "long_text": return randomFrom(["Great product!", "Needs improvement", "Love the UI", "Fast and reliable", "Could use more features", "Amazing experience", "Very intuitive"]);
      case "number": return String(randomInt(1, 15));
      case "rating": return String(randomInt(3, 5));
      case "checkbox": return randomFrom(["true", "false"]);
      case "single_select": {
        const opts = options as Array<{ value: string }> | null;
        return opts ? randomFrom(opts).value : "unknown";
      }
      case "multi_select": {
        const opts = options as Array<{ value: string }> | null;
        if (!opts) return "unknown";
        const count = randomInt(1, Math.min(3, opts.length));
        return opts.slice(0, count).map((o) => o.value).join(",");
      }
      default: return "N/A";
    }
  }

  async function insertResponses(formId: string, fields: any[], count: number) {
    for (let i = 0; i < count; i++) {
      const responseId = uuid();
      const daysBack = randomInt(0, 29);
      const createdAt = daysAgo(daysBack);
      const duration = randomInt(30, 300);
      const status = Math.random() > 0.15 ? "completed" : "abandoned";

      await db.execute(sql`
        INSERT INTO responses (id, form_id, respondent_email, respondent_name, status, started_at, completed_at, duration_seconds, created_at)
        VALUES (${responseId}, ${formId}, ${`user${i}@${randomFrom(domains)}`}, ${randomFrom(names)}, ${status}, ${createdAt.toISOString()}, ${status === "completed" ? createdAt.toISOString() : null}, ${status === "completed" ? duration : null}, ${createdAt.toISOString()})
      `);

      // Insert answers for completed responses
      if (status === "completed") {
        for (const field of fields) {
          const value = generateAnswer(field.field_type, field.options);
          await db.execute(sql`
            INSERT INTO response_answers (id, response_id, field_id, value)
            VALUES (${uuid()}, ${responseId}, ${field.id}, ${value})
          `);
        }
      }
    }
  }

  await insertResponses(FORM_IDS.startup, startupFieldRows.rows, 432);
  console.log("   ✓ Startup Feedback Flow: 432 responses");

  await insertResponses(FORM_IDS.anime, animeFieldRows.rows, 218);
  console.log("   ✓ Anime Convention RSVP: 218 responses");

  await insertResponses(FORM_IDS.gamedev, gamedevFieldRows.rows, 89);
  console.log("   ✓ Game Dev Survey: 89 responses");
}

async function seedAnalytics() {
  console.log("📈 Seeding 30 days of analytics...");

  for (const formId of Object.values(FORM_IDS)) {
    for (let d = 0; d < 30; d++) {
      const date = dateStr(daysAgo(d));
      const views = randomInt(20, 150);
      const starts = randomInt(10, Math.floor(views * 0.7));
      const completions = randomInt(5, Math.floor(starts * 0.8));
      const abandons = starts - completions;

      await db.execute(sql`
        INSERT INTO form_analytics (id, form_id, date, views, starts, completions, abandons, avg_duration_seconds)
        VALUES (${uuid()}, ${formId}, ${date}, ${views}, ${starts}, ${completions}, ${abandons}, ${randomInt(60, 240)})
        ON CONFLICT (form_id, date) DO UPDATE SET views = ${views}, starts = ${starts}, completions = ${completions}, abandons = ${abandons}
      `);
    }
  }
}

async function seedApiKey() {
  console.log("🔑 Seeding demo API key...");
  const rawKey = `sk_live_demo_${randomBytes(16).toString("hex")}`;
  const keyHash = createHash("sha256").update(rawKey).digest("hex");
  const keyPrefix = rawKey.slice(0, 12);

  await db.execute(sql`
    INSERT INTO api_keys (id, user_id, name, key_hash, key_prefix)
    VALUES (${uuid()}, ${DEMO_USER_ID}, 'Demo API Key', ${keyHash}, ${keyPrefix})
  `);

  console.log(`   Key (save this): ${rawKey}`);
}

// ─── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 CanvasForms Seed Script\n");
  console.log("═══════════════════════════════════════\n");

  await seedUser();
  await seedThemes();
  await seedForms();
  await seedFields();
  await seedResponses();
  await seedAnalytics();
  await seedApiKey();

  console.log("\n═══════════════════════════════════════");
  console.log("✅ Seed complete!\n");
  console.log("Demo credentials:");
  console.log("  Email: admin@canvasforms.io");
  console.log("  Plan:  Pro");
  console.log("\nForms created:");
  console.log("  • Startup Feedback Flow (public)  → /form/startup-feedback-flow");
  console.log("  • Anime Convention RSVP (public)  → /form/anime-convention-rsvp");
  console.log("  • Game Dev Survey (unlisted)      → /form/gamedev-community-survey");
  console.log("\nThemes: Dark Indigo, Sunset Orange, Forest Green, Midnight Blue");

  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
