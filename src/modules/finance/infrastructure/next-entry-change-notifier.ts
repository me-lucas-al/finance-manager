import { revalidatePath, revalidateTag } from 'next/cache';
import type { EntryChangeNotifier } from '../domain/ports/entry-change-notifier';
import { ledgerCacheTag } from '../application/services/ledger-cache-tag';

export class NextEntryChangeNotifier implements EntryChangeNotifier {
  async notifyEntriesChanged(userId: string): Promise<void> {
    try {
      revalidateTag(ledgerCacheTag(userId), { expire: 0 });
      revalidatePath('/', 'layout');
    } catch (error) {
      console.warn('Entry change revalidation skipped:', error instanceof Error ? error.message : error);
    }
  }
}
