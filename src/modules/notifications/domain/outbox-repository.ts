export type OutboxStatus = 'PENDING' | 'SENT' | 'FAILED';

export type OutboxChannel = 'telegram' | 'whatsapp' | 'all';

export type OutboxMessage = {
  id: string;
  userId: string;
  channel: OutboxChannel;
  eventType: string;
  payload: string;
  status: OutboxStatus;
  attempts: number;
  lastError: string | null;
  createdAt: Date | string;
  sentAt: Date | string | null;
};

export type NewOutboxMessage = {
  id?: string;
  userId: string;
  channel: OutboxChannel;
  eventType: string;
  payload: string;
};

export interface OutboxRepository {
  enqueue(data: NewOutboxMessage): Promise<OutboxMessage>;
  findPending(limit?: number): Promise<OutboxMessage[]>;
  markSent(id: string): Promise<void>;
  markFailed(id: string, error: string): Promise<void>;
}
