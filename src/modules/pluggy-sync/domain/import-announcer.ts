export type ImportedEntryKind = 'expense' | 'income' | 'investment';

export type ImportedEntry = {
  kind: ImportedEntryKind;
  description: string;
  amount: number;
  bank: string;
};

export interface ImportAnnouncer {
  announce(userId: string, entries: ImportedEntry[]): Promise<void>;
}
