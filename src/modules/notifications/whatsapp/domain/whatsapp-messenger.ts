export interface WhatsappMessenger {
  sendMessage(userId: string, text: string): Promise<boolean>;
}
