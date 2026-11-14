import type {
  NewOutboxMessage,
  OutboxMessage,
  OutboxRepository,
} from '@/modules/notifications/domain/outbox-repository';

export class FakeOutboxRepository implements OutboxRepository {
  public items: OutboxMessage[] = [];
  private counter = 1;

  async enqueue(data: NewOutboxMessage): Promise<OutboxMessage> {
    const item: OutboxMessage = {
      id: data.id ?? String(this.counter++),
      userId: data.userId,
      channel: data.channel,
      eventType: data.eventType,
      payload: data.payload,
      status: 'PENDING',
      attempts: 0,
      lastError: null,
      createdAt: new Date().toISOString(),
      sentAt: null,
    };
    this.items.push(item);
    return item;
  }

  async findPending(limit = 20): Promise<OutboxMessage[]> {
    return this.items
      .filter((i) => i.status === 'PENDING')
      .slice(0, limit);
  }

  async markSent(id: string): Promise<void> {
    const item = this.items.find((i) => i.id === id);
    if (!item) return;
    item.status = 'SENT';
    item.sentAt = new Date().toISOString();
  }

  async markFailed(id: string, error: string): Promise<void> {
    const item = this.items.find((i) => i.id === id);
    if (!item) return;
    item.attempts += 1;
    item.lastError = error;
    if (item.attempts >= 3) {
      item.status = 'FAILED';
    }
  }
}
