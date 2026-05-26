/**
 * Quick test for Resend email integration.
 *
 * Usage:
 *   RESEND_API_KEY="re_xxxxxxxxx" REDIS_URL="redis://localhost:6379" \
 *   DATABASE_URL="postgresql://canvasforms:canvasforms@localhost:5432/canvasforms" \
 *   npx tsx packages/services/email/test.ts
 *
 * Replace re_xxxxxxxxx with your real Resend API key.
 */
import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;

if (!RESEND_API_KEY || RESEND_API_KEY === "re_placeholder") {
  console.error("❌ Set RESEND_API_KEY to your real key:");
  console.error("   RESEND_API_KEY='re_xxxxxxxxx' npx tsx packages/services/email/test.ts");
  process.exit(1);
}

async function main() {
  console.log("📧 Sending test email via Resend...\n");

  const resend = new Resend(RESEND_API_KEY);

  const { data, error } = await resend.emails.send({
    from: "onboarding@resend.dev",
    to: "jaaniraj34@gmail.com",
    subject: "CanvasForms — Test Email ✅",
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; background: #121319; color: #e4e1eb; border-radius: 12px;">
        <h2 style="color: #bdc2ff; margin: 0 0 8px;">CanvasForms Email Test</h2>
        <p style="color: #c6c5d5;">If you're reading this, Resend integration is working correctly.</p>
        <div style="background: #1f1f26; border: 1px solid #454653; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <p style="margin: 0; color: #908f9e; font-size: 12px;">Status</p>
          <p style="margin: 4px 0 0; color: #bdc2ff; font-size: 20px; font-weight: 700;">✅ Connected</p>
        </div>
        <p style="color: #454653; font-size: 11px;">— CanvasForms Backend</p>
      </div>
    `,
  });

  if (error) {
    console.error("❌ Failed:", error);
    process.exit(1);
  }

  console.log("✅ Email sent successfully!");
  console.log(`   Resend ID: ${data?.id}`);
  console.log(`   To: jaaniraj34@gmail.com`);
  console.log(`   Subject: CanvasForms — Test Email ✅`);
}

main();
