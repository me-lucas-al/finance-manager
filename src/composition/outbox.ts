import { outboxRepository } from './outbox-repo';
import { MultiChannelOutboxDispatcher } from '@/modules/notifications/infrastructure/multi-channel-outbox-dispatcher';
import { RelayOutboxUseCase } from '@/modules/notifications/application/relay-outbox';
import { OutboxImportAnnouncer } from '@/modules/pluggy-sync/infrastructure/outbox-import-announcer';
import { BroadcastTextMessenger } from '@/modules/pluggy-sync/infrastructure/broadcast-text-messenger';
import { transactionRepository } from './open-finance';
import { telegramMessenger } from './telegram';
import { whatsappMessenger } from './whatsapp';

export { outboxRepository };

const broadcastSender = new BroadcastTextMessenger([whatsappMessenger, telegramMessenger]);

export const outboxDispatcher = new MultiChannelOutboxDispatcher(
  telegramMessenger,
  broadcastSender,
  transactionRepository
);

export const relayOutbox = new RelayOutboxUseCase(outboxRepository, outboxDispatcher);

export const outboxImportAnnouncer = new OutboxImportAnnouncer(outboxRepository, relayOutbox);
