export interface TelegramUpdateRepository {
  isProcessed(updateId: number): Promise<boolean>;
  markProcessed(updateId: number): Promise<void>;
}
