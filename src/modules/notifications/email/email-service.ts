import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { buildPasswordResetEmail } from './password-reset-email';
import type { EmailSendResult, EmailService, SendEmailParams } from './email-types';

export type { EmailSendResult, EmailService, SendEmailParams } from './email-types';

const DEFAULT_FROM_ADDRESS = 'FinanceManager <nao-responda@financemanager.app>';

export class DefaultEmailService implements EmailService {
  private resend: Resend | null = null;
  private smtpTransporter: nodemailer.Transporter | null = null;
  private fromAddress: string;

  constructor() {
    this.fromAddress = process.env.EMAIL_FROM || process.env.MAIL_FROM || DEFAULT_FROM_ADDRESS;

    if (process.env.RESEND_API_KEY) {
      this.resend = new Resend(process.env.RESEND_API_KEY);
    } else if (process.env.SMTP_HOST) {
      this.smtpTransporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true' || Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER || '',
          pass: process.env.SMTP_PASS || process.env.SMTP_PASSWORD || '',
        },
      });
    }
  }

  async sendEmail(params: SendEmailParams): Promise<EmailSendResult> {
    try {
      if (this.resend) return await this.sendWithResend(this.resend, params);
      if (this.smtpTransporter) return await this.sendWithSmtp(this.smtpTransporter, params);
      return this.logToConsole(params);
    } catch (err) {
      console.error('[EmailService] Unexpected failure sending email:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Falha ao enviar email' };
    }
  }

  async sendPasswordResetEmail(email: string, resetUrl: string): Promise<EmailSendResult> {
    return this.sendEmail({ to: email, ...buildPasswordResetEmail(resetUrl) });
  }

  private async sendWithResend(resend: Resend, params: SendEmailParams): Promise<EmailSendResult> {
    const { data, error } = await resend.emails.send({
      from: this.fromAddress,
      to: [params.to],
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    if (error) {
      console.error('[EmailService] Error sending email via Resend:', error);
      return { success: false, error: error.message };
    }
    return { success: true, messageId: data?.id };
  }

  private async sendWithSmtp(
    transporter: nodemailer.Transporter,
    params: SendEmailParams
  ): Promise<EmailSendResult> {
    const info = await transporter.sendMail({
      from: this.fromAddress,
      to: params.to,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    return { success: true, messageId: info.messageId };
  }

  private logToConsole(params: SendEmailParams): EmailSendResult {
    console.log('----------------------------------------------------');
    console.log('[EmailService (Dev / No SMTP configured)] Sending email:');
    console.log(`To: ${params.to}`);
    console.log(`From: ${this.fromAddress}`);
    console.log(`Subject: ${params.subject}`);
    console.log(`Body (Text): \n${params.text}`);
    console.log('----------------------------------------------------');
    return { success: true, messageId: `dev-${Date.now()}` };
  }
}

export const emailService = new DefaultEmailService();
