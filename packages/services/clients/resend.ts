import { Resend } from "resend";
import { env } from "../env";

let resendClient: Resend | null = null;

export function getResendClient(): Resend {
  if (!resendClient) {
    if (!env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }
    resendClient = new Resend(env.RESEND_API_KEY);
  }
  return resendClient;
}
