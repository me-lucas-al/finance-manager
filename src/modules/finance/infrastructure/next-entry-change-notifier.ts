import { revalidatePath } from 'next/cache';
import type { EntryChangeNotifier } from '../domain/ports/entry-change-notifier';

export class NextEntryChangeNotifier implements EntryChangeNotifier {
  async notifyEntriesChanged(): Promise<void> {
    try {
      revalidatePath('/', 'layout');
    } catch (error) {
      console.warn('Entry change revalidation skipped:', error instanceof Error ? error.message : error);
    }
  }
}
