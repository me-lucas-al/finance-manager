export type Account = {
  id: string;
  userId: string;
  pluggyAccountId: string;
  pluggyItemId: string;
  bank: string;
  accountType: string;
  itemStatus: string | null;
  lastSyncedAt: string | null;
  balance: number | null;
  creditLimit: number | null;
  createdAt: string;
};

export type NewAccount = Omit<Account, 'id' | 'createdAt' | 'balance' | 'creditLimit'> &
  Partial<Pick<Account, 'balance' | 'creditLimit'>>;

export type ItemOwner = { pluggyItemId: string; userId: string };

export interface AccountRepository {
  findByPluggyAccountId(pluggyAccountId: string): Promise<Account | null>;
  findAllByPluggyItemId(pluggyItemId: string): Promise<Account[]>;
  findAllByUserId(userId: string): Promise<Account[]>;
  listItemOwners(): Promise<ItemOwner[]>;
  upsert(data: NewAccount): Promise<Account>;
}
