import type { Account } from '@/modules/open-finance/domain/repositories/account-repository';

export type BankConnection = {
  pluggyItemId: string;
  bank: string;
  itemStatus: string | null;
  accountCount: number;
  lastSyncedAt: string | null;
};

export function groupAccountsByItem(accounts: Account[]): BankConnection[] {
  const byItem = new Map<string, Account[]>();
  for (const account of accounts) {
    const group = byItem.get(account.pluggyItemId);
    if (group) group.push(account);
    else byItem.set(account.pluggyItemId, [account]);
  }

  return Array.from(byItem.entries()).map(([pluggyItemId, group]) => {
    const lastSyncedAt = group
      .map((account) => account.lastSyncedAt)
      .filter((value): value is string => value !== null)
      .sort()
      .at(-1) ?? null;

    return {
      pluggyItemId,
      bank: group[0].bank,
      itemStatus: group[0].itemStatus,
      accountCount: group.length,
      lastSyncedAt,
    };
  });
}
