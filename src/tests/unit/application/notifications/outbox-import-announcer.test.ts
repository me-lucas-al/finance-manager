import { describe, it, expect, vi } from 'vitest';
import { OutboxImportAnnouncer } from '@/modules/pluggy-sync/infrastructure/outbox-import-announcer';
import { FakeOutboxRepository } from '@/tests/fakes/fake-outbox-repository';
import type { ImportedEntry } from '@/modules/pluggy-sync/domain/import-announcer';
import type { RelayOutboxUseCase } from '@/modules/notifications/application/relay-outbox';

describe('OutboxImportAnnouncer', () => {
  it('does nothing when entries array is empty', async () => {
    const outboxRepo = new FakeOutboxRepository();
    const announcer = new OutboxImportAnnouncer(outboxRepo);

    await announcer.announce('user-1', []);

    expect(outboxRepo.items).toHaveLength(0);
  });

  it('enqueues import summary and triggers relay', async () => {
    const outboxRepo = new FakeOutboxRepository();
    const relay = { execute: vi.fn(async () => ({ processed: 1, succeeded: 1, failed: 0 })) };
    const announcer = new OutboxImportAnnouncer(outboxRepo, relay as unknown as RelayOutboxUseCase);

    const entries: ImportedEntry[] = [
      { kind: 'expense', description: 'Café', amount: 15, bank: 'Nubank' },
    ];

    await announcer.announce('user-1', entries);

    expect(outboxRepo.items).toHaveLength(1);
    expect(outboxRepo.items[0].userId).toBe('user-1');
    expect(outboxRepo.items[0].eventType).toBe('import_announcement');
    expect(outboxRepo.items[0].payload).toContain('Café');
  });
});
