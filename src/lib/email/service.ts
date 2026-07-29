import type { SendEmailInput, SendEmailResult } from "./types";

export interface EmailService {
  send(input: SendEmailInput): Promise<SendEmailResult>;
}

export class ConsoleEmailService implements EmailService {
  async send(input: SendEmailInput): Promise<SendEmailResult> {
    return {
      messageId: `msg_${Date.now()}`,
      provider: "console"
    };
  }
}

class ResendEmailService implements EmailService {
  async send(input: SendEmailInput): Promise<SendEmailResult> {
    const apiKey = process.env.RESEND_API_KEY?.trim();
    const from = process.env.EMAIL_FROM?.trim();
    if (!apiKey || !from) {
      throw new Error("EMAIL_NOT_CONFIGURED");
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({ from, to: [input.to], subject: input.subject, html: input.html, text: input.text })
    });
    const body = (await response.json().catch(() => null)) as { id?: string; message?: string } | null;
    if (!response.ok || !body?.id) {
      throw new Error(`EMAIL_SEND_FAILED:${response.status}:${body?.message ?? "unknown"}`);
    }
    return { messageId: body.id, provider: "resend" };
  }
}

const emailService: EmailService = process.env.RESEND_API_KEY?.trim() && process.env.EMAIL_FROM?.trim()
  ? new ResendEmailService()
  : new ConsoleEmailService();

export async function sendTransactionalEmail(input: SendEmailInput) {
  return emailService.send(input);
}
