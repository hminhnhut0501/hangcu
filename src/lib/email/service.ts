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

const emailService = new ConsoleEmailService();

export async function sendTransactionalEmail(input: SendEmailInput) {
  return emailService.send(input);
}
