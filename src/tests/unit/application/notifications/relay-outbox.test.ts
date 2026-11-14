import { describe, it, expect, vi } from 'vitest';
import { RelayOutboxUseCase } from '@/modules/notifications/application/relay-outbox';
import { FakeOutboxRepository } from '@/tests/fakes/fake-outbox-repository';

describe('RelayOutboxUseCase', () => {
  it('dispatches pending messages and marks them sent', async () => {
    const outboxRepo = new FakeOutboxRepository();
    const message = await outboxRepo.enqueue({
      userId: 'user-1',
      channel: 'telegram',
      eventType: 'ask_reason',
      payload: JSON.stringify({ text: 'Qual o motivo?' }),
    });

    const dispatcher = { dispatch: vi.fn(async () => {}) };
    const relay = new RelayOutboxUseCase(outboxRepo, dispatcher);

    const result = await relay.execute();

    expect(result).toEqual({ processed: 1, succeeded: 1, failed: 0 });
    expect(dispatcher.dispatch).toHaveBeenCalledWith(expect.objectContaining({ id: message.id }));
    expect(outboxRepo.items[0].status).toBe('SENT');
    expect(outboxRepo.items[0].sentAt).not.toBeNull();
  });

  it('marks failed when dispatcher throws an error', async () => {
    const outboxRepo = new FakeOutboxRepository();
    await outboxRepo.enqueue({
      userId: 'user-1',
      channel: 'telegram',
      eventType: 'ask_reason',
      payload: JSON.stringify({ text: 'Qual o motivo?' }),
    });

    const dispatcher = {
      dispatch: vi.fn(async () => {
        throw new Error('Telegram network failure');
      }),
    };
    const relay = new RelayOutboxUseCase(outboxRepo, dispatcher);

    const result = await relay.execute();

    expect(result).toEqual({ processed: 1, succeeded: 0, failed: 1 });
    expect(outboxRepo.items[0].attempts).toBe(1);
    expect(outboxRepo.items[0].lastError).toBe('Telegram network failure');
    expect(outboxRepo.items[0].status).toBe('PENDING');
  });

  it('changes status to FAILED after 3 attempts', async () => {
    const outboxRepo = new FakeOutboxRepository();
    await outboxRepo.enqueue({
      userId: 'user-1',
      channel: 'telegram',
      eventType: 'ask_reason',
      payload: JSON.stringify({ text: 'Qual o motivo?' }),
    });

    const dispatcher = {
      dispatch: vi.fn(async () => {
        throw new Error('Permanent failure');
      }),
    };
    const relay = new RelayOutboxUseCase(outboxRepo, dispatcher);

    await relay.execute();
    await relay.execute();
    await relay.execute();

    expect(outboxRepo.items[0].attempts).toBe(3);
    expect(outboxRepo.items[0].status).toBe('FAILED');
  });
});
