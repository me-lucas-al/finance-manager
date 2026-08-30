export type Account = {
  id: string;
  userId: string;
  pluggyAccountId: string;
  pluggyItemId: string;
  bank: string;
  accountType: string;
  // Pluggy Item status (UPDATED, LOGIN_ERROR, OUTDATED, ...) as of the last time
  // we asked Pluggy about this item — either at connect time or on ingestion.
  itemStatus: string | null;
  lastSyncedAt: string | null;
  createdAt: string;
};

export type NewAccount = Omit<Account, 'id' | 'createdAt'>;

export interface AccountRepository {
  findByPluggyAccountId(pluggyAccountId: string): Promise<Account | null>;
  findAllByPluggyItemId(pluggyItemId: string): Promise<Account[]>;
  upsert(data: NewAccount): Promise<Account>;
}
