export type AuthEntries = Record<string, string | null>;

export interface WhatsappAuthStore {
  readMany(userId: string, names: string[]): Promise<Record<string, string>>;
  write(userId: string, entries: AuthEntries): Promise<void>;
  clear(userId: string): Promise<void>;
}
