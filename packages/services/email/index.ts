import { db } from "@repo/database";
import { emailNotificationsTable } from "@repo/database/schema";
import { logger } from "@repo/logger";
import { getResendClient } from "../clients/resend";
import { env } from "../env";

class EmailService {
  private get fromEmail(): string {
    return env.RESEND_FROM_EMAIL ?? "noreply@canvasforms.io";
  }

  /**
   * Send a "new response received" notification to the form creator.
   */
  async sendNewResponseNotification(data: {
    creatorEmail: string;
    creatorName: string;
    formTitle: string;
    responseCount: number;
    userId: string;
    formId: string;
  }): Promise<void> {
    const subject = `New response on "${data.formTitle}"`;
    const html = `
      <div style="font-family: 'Inter', sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; background: #121319; color: #e4e1eb; border-radius: 12px;">
        <h2 style="color: #bdc2ff; margin: 0 0 8px;">New Response Received</h2>
        <p style="color: #c6c5d5; margin: 0 0 24px;">Hi ${data.creatorName},</p>
        <div style="background: #1f1f26; border: 1px solid #454653; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
          <p style="margin: 0 0 4px; color: #908f9e; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Form</p>
          <p style="margin: 0 0 16px; color: #e4e1eb; font-size: 16px; font-weight: 600;">${data.formTitle}</p>
          <p style="margin: 0; color: #908f9e; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Total Responses</p>
          <p style="margin: 0; color: #bdc2ff; font-size: 24px; font-weight: 700;">${data.responseCount}</p>
        </div>
        <a href="${env.RESEND_FROM_EMAIL ? "https://canvasforms.io" : "http://localhost:3000"}/dashboard" style="display: inline-block; background: #818cf8; color: #101b8a; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">View Responses</a>
        <p style="color: #454653; font-size: 11px; margin-top: 32px;">— CanvasForms</p>
      </div>
    `;

    await this.send({
      to: data.creatorEmail,
      subject,
      html,
      type: "new_response",
      userId: data.userId,
      formId: data.formId,
    });
  }

  /**
   * Send a "form published" confirmation to the creator.
   */
  async sendFormPublishedConfirmation(data: {
    creatorEmail: string;
    creatorName: string;
    formTitle: string;
    formSlug: string;
    userId: string;
    formId: string;
  }): Promise<void> {
    const formUrl = `${env.RESEND_FROM_EMAIL ? "https://canvasforms.io" : "http://localhost:3000"}/form/${data.formSlug}`;
    const subject = `"${data.formTitle}" is now live!`;
    const html = `
      <div style="font-family: 'Inter', sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; background: #121319; color: #e4e1eb; border-radius: 12px;">
        <h2 style="color: #bdc2ff; margin: 0 0 8px;">Form Published 🎉</h2>
        <p style="color: #c6c5d5; margin: 0 0 24px;">Hi ${data.creatorName}, your form is now live and accepting responses.</p>
        <div style="background: #1f1f26; border: 1px solid #454653; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
          <p style="margin: 0 0 4px; color: #908f9e; font-size: 12px; text-transform: uppercase;">Form</p>
          <p style="margin: 0 0 16px; color: #e4e1eb; font-size: 16px; font-weight: 600;">${data.formTitle}</p>
          <p style="margin: 0 0 4px; color: #908f9e; font-size: 12px; text-transform: uppercase;">Share Link</p>
          <p style="margin: 0; color: #bdc2ff; font-size: 14px; word-break: break-all;">${formUrl}</p>
        </div>
        <a href="${formUrl}" style="display: inline-block; background: #818cf8; color: #101b8a; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">View Live Form</a>
        <p style="color: #454653; font-size: 11px; margin-top: 32px;">— CanvasForms</p>
      </div>
    `;

    await this.send({
      to: data.creatorEmail,
      subject,
      html,
      type: "form_published",
      userId: data.userId,
      formId: data.formId,
    });
  }

  /**
   * Send a "response limit reached" alert.
   */
  async sendResponseLimitReached(data: {
    creatorEmail: string;
    formTitle: string;
    limit: number;
    userId: string;
    formId: string;
  }): Promise<void> {
    const subject = `Response limit reached on "${data.formTitle}"`;
    const html = `
      <div style="font-family: 'Inter', sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; background: #121319; color: #e4e1eb; border-radius: 12px;">
        <h2 style="color: #f7bd3e; margin: 0 0 8px;">⚠️ Response Limit Reached</h2>
        <p style="color: #c6c5d5; margin: 0 0 24px;">Your form "${data.formTitle}" has reached its limit of <strong>${data.limit}</strong> responses and is no longer accepting submissions.</p>
        <a href="${env.RESEND_FROM_EMAIL ? "https://canvasforms.io" : "http://localhost:3000"}/dashboard" style="display: inline-block; background: #818cf8; color: #101b8a; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">Manage Form</a>
        <p style="color: #454653; font-size: 11px; margin-top: 32px;">— CanvasForms</p>
      </div>
    `;

    await this.send({
      to: data.creatorEmail,
      subject,
      html,
      type: "response_limit_reached",
      userId: data.userId,
      formId: data.formId,
    });
  }

  /**
   * Core send method — sends via Resend and logs to DB.
   */
  private async send(data: {
    to: string;
    subject: string;
    html: string;
    type: string;
    userId: string;
    formId?: string;
  }): Promise<void> {
    let resendId: string | null = null;
    let status: "sent" | "failed" = "failed";

    try {
      const resend = getResendClient();
      const result = await resend.emails.send({
        from: this.fromEmail,
        to: data.to,
        subject: data.subject,
        html: data.html,
      });

      if (result.data?.id) {
        resendId = result.data.id;
        status = "sent";
        logger.info("Email sent", { to: data.to, type: data.type, resendId });
      } else {
        logger.error("Email send failed", { to: data.to, type: data.type, error: result.error });
      }
    } catch (err) {
      logger.error("Email send exception", {
        to: data.to,
        type: data.type,
        error: err instanceof Error ? err.message : "unknown",
      });
    }

    // Log to DB (fire-and-forget)
    try {
      await db.insert(emailNotificationsTable).values({
        userId: data.userId,
        formId: data.formId ?? null,
        type: data.type,
        subject: data.subject,
        body: data.html,
        sentAt: status === "sent" ? new Date() : null,
        status,
        resendId,
      });
    } catch (dbErr) {
      logger.error("Failed to log email notification", {
        error: dbErr instanceof Error ? dbErr.message : "unknown",
      });
    }
  }
}

export default EmailService;
