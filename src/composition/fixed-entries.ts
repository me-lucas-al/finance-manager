import { CreateFixedEntryUseCase } from '@/modules/finance/application/fixed-entries/create-fixed-entry';
import { DeleteFixedEntryUseCase } from '@/modules/finance/application/fixed-entries/delete-fixed-entry';
import { FixedEntryLauncher } from '@/modules/finance/application/fixed-entries/fixed-entry-launcher';
import { GenerateDueFixedEntriesUseCase } from '@/modules/finance/application/fixed-entries/generate-due-fixed-entries';
import { ListFixedEntriesUseCase } from '@/modules/finance/application/fixed-entries/list-fixed-entries';
import { SendFixedEntryRemindersUseCase } from '@/modules/finance/application/fixed-entries/send-fixed-entry-reminders';
import { SetFixedEntryActiveUseCase } from '@/modules/finance/application/fixed-entries/set-fixed-entry-active';
import { ShowFixedEntriesUseCase } from '@/modules/finance/application/fixed-entries/show-fixed-entries';
import { UpdateFixedEntryUseCase } from '@/modules/finance/application/fixed-entries/update-fixed-entry';
import { AlertLogReminderLog } from '@/modules/finance/infrastructure/alert-log-reminder-log';
import { DrizzleFixedEntryRepository } from '@/modules/finance/infrastructure/drizzle-fixed-entry-repository';
import { DrizzleReminderPreferencesReader } from '@/modules/finance/infrastructure/drizzle-reminder-preferences-reader';
import { PersistenceFixedLaunchLookup } from '@/modules/finance/infrastructure/persistence-fixed-launch-lookup';
import { TelegramFixedLaunchAnnouncer } from '@/modules/finance/infrastructure/telegram-fixed-launch-announcer';
import { TelegramPushReminderDelivery } from '@/modules/finance/infrastructure/telegram-push-reminder-delivery';
import { SupabaseAlertLogRepository } from '@/modules/open-finance/infrastructure/supabase-alert-log-repository';
import { deleteEntry, entryChangeNotifier, ledgerService, registerEntry, updateEntry } from './finance';
import { telegramMessenger } from './telegram';

export const fixedEntryRepository = new DrizzleFixedEntryRepository();
const fixedLaunchLookup = new PersistenceFixedLaunchLookup();
const launcher = new FixedEntryLauncher(registerEntry, new TelegramFixedLaunchAnnouncer(telegramMessenger));

export const listFixedEntries = new ListFixedEntriesUseCase(fixedEntryRepository, fixedLaunchLookup);
export const showFixedEntries = new ShowFixedEntriesUseCase(listFixedEntries, ledgerService);
export const generateDueFixedEntries = new GenerateDueFixedEntriesUseCase(fixedEntryRepository, fixedLaunchLookup, launcher);

export const createFixedEntry = new CreateFixedEntryUseCase(fixedEntryRepository, launcher, entryChangeNotifier);

export const updateFixedEntry = new UpdateFixedEntryUseCase(
  fixedEntryRepository,
  fixedLaunchLookup,
  updateEntry,
  entryChangeNotifier,
);

export const setFixedEntryActive = new SetFixedEntryActiveUseCase(fixedEntryRepository, entryChangeNotifier);

export const deleteFixedEntry = new DeleteFixedEntryUseCase(
  fixedEntryRepository,
  fixedLaunchLookup,
  deleteEntry,
  entryChangeNotifier,
);

export const sendFixedEntryReminders = new SendFixedEntryRemindersUseCase(
  fixedEntryRepository,
  new DrizzleReminderPreferencesReader(),
  new TelegramPushReminderDelivery(telegramMessenger),
  new AlertLogReminderLog(new SupabaseAlertLogRepository()),
);
