import { after } from 'next/server';
import { formatImportSummary } from '../domain/format-import-summary';
import type { ImportAnnouncer, ImportedEntry } from '../domain/import-announcer';
import type { OutboxRepository } from '@/modules/notifications/domain/outbox-repository';
import type { RelayOutboxUseCase } from '@/modules/notifications/application/relay-outbox';

export class OutboxImportAnnouncer implements ImportAnnouncer {
  constructor(
    private outboxRepo: OutboxRepository,
    private relay?: RelayOutboxUseCase
  ) {}

  async announce(userId: string, entries: ImportedEntry[]): Promise<void> {
    if (entries.length === 0) return;
    const text = formatImportSummary(entries);

    await this.outboxRepo.enqueue({
      userId,
      channel: 'all',
      eventType: 'import_announcement',
      payload: JSON.stringify({ text }),
    });

    if (this.relay) {
      const trigger = () => this.relay?.execute();
      try {
        after(trigger);
      } catch {
        void trigger();
      }
    }
  }
}
