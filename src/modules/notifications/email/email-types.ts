export interface SendEmailParams {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface EmailService {
  sendEmail(params: SendEmailParams): Promise<EmailSendResult>;
  sendPasswordResetEmail(email: string, resetUrl: string): Promise<EmailSendResult>;
}
