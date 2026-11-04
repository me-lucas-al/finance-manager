import { KNOWN_BANK_NAMES } from '@/lib/bank-names';
import type { Account } from './repositories/account-repository';

export type BankConnectionHealth = 'healthy' | 'updating' | 'attention';

export type ConnectedBank = {
  itemId: string;
  name: string;
  health: BankConnectionHealth;
  accountCount: number;
  lastSyncedAt: string | null;
};

const HEALTHY_STATUSES = ['UPDATED'];
const UPDATING_STATUSES = ['UPDATING', 'CREATING'];

export function healthOfItemStatus(status: string | null): BankConnectionHealth {
  if (status === null || UPDATING_STATUSES.includes(status)) return 'updating';
  return HEALTHY_STATUSES.includes(status) ? 'healthy' : 'attention';
}

const latestOf = (first: string | null, second: string | null): string | null => {
  if (!first || !second) return first ?? second;
  return first > second ? first : second;
};

export function groupConnectedBanks(accounts: Account[]): ConnectedBank[] {
  const banks = new Map<string, ConnectedBank>();
  for (const account of accounts) {
    const known = banks.get(account.pluggyItemId);
    banks.set(account.pluggyItemId, {
      itemId: account.pluggyItemId,
      name: known?.name ?? KNOWN_BANK_NAMES[account.bank] ?? account.bank,
      health: known?.health ?? healthOfItemStatus(account.itemStatus),
      accountCount: (known?.accountCount ?? 0) + 1,
      lastSyncedAt: latestOf(known?.lastSyncedAt ?? null, account.lastSyncedAt),
    });
  }
  return [...banks.values()].sort((first, second) => first.name.localeCompare(second.name, 'pt-BR'));
}
