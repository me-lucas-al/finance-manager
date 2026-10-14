export interface EntryChangeNotifier {
  notifyEntriesChanged(userId: string): Promise<void>;
}

export const noopEntryChangeNotifier: EntryChangeNotifier = {
  async notifyEntriesChanged() {},
};
