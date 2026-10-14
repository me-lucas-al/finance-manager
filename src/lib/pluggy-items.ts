import type { Transaction as PluggyTransaction } from 'pluggy-sdk';
import { getPluggyClient } from '@/lib/pluggy';

export async function fetchItemOwner(itemId: string): Promise<string | null> {
  const item = await getPluggyClient().fetchItem(itemId);
  return item.clientUserId ?? null;
}

export function fetchTransactionsSince(accountId: string, dateFrom: string): Promise<PluggyTransaction[]> {
  return getPluggyClient().fetchAllTransactions(accountId, { dateFrom });
}

export async function fetchItemInvestments(itemId: string) {
  const page = await getPluggyClient().fetchInvestments(itemId);
  return page.results;
}

export async function deletePluggyItem(itemId: string): Promise<void> {
  await getPluggyClient().deleteItem(itemId);
}

export type PluggyAccountBalance = {
  pluggyAccountId: string;
  balance: number;
  creditLimit: number | null;
};

export async function fetchItemAccountBalances(itemId: string): Promise<PluggyAccountBalance[]> {
  const page = await getPluggyClient().fetchAccounts(itemId);
  return page.results.map((account) => ({
    pluggyAccountId: account.id,
    balance: account.balance,
    creditLimit: account.creditData?.creditLimit ?? null,
  }));
}
