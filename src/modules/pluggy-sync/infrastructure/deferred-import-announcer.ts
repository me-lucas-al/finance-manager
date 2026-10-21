import { after } from 'next/server';
import { formatImportSummary } from '../domain/format-import-summary';
import type { ImportAnnouncer, ImportedEntry } from '../domain/import-announcer';

type TextMessenger = { sendMessage(userId: string, text: string): Promise<boolean> };

export class DeferredImportAnnouncer implements ImportAnnouncer {
  constructor(private readonly messenger: TextMessenger) {}

  async announce(userId: string, entries: ImportedEntry[]): Promise<void> {
    if (entries.length === 0) return;
    const deliver = () => this.deliver(userId, entries);
    try {
      after(deliver);
    } catch {
      void deliver();
    }
  }

  private async deliver(userId: string, entries: ImportedEntry[]): Promise<void> {
    try {
      await this.messenger.sendMessage(userId, formatImportSummary(entries));
    } catch (error) {
      console.error(`Pluggy import announcement failed for user ${userId}:`, error);
    }
  }
}
