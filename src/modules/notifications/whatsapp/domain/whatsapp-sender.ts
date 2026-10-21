export class WhatsappLoggedOutError extends Error {
  constructor() {
    super('WhatsApp session was logged out');
  }
}

export interface WhatsappSender {
  sendText(userId: string, jid: string, text: string): Promise<void>;
  logout(userId: string): Promise<void>;
}
