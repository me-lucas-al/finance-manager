import type { Transaction as PluggyTransaction } from 'pluggy-sdk';
import { getPluggyClient } from './pluggy-client';
import { normalizeBankName } from './normalize-bank-name';

export type PluggyAccountBalance = {
  pluggyAccountId: string;
  balance: number;
  creditLimit: number | null;
};

export type PluggyItemConnectionInfo = {
  status: string;
  accounts: { id: string; accountType: string; bank: string }[];
};

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

export async function fetchItemAccountBalances(itemId: string): Promise<PluggyAccountBalance[]> {
  const page = await getPluggyClient().fetchAccounts(itemId);
  return page.results.map((account) => ({
    pluggyAccountId: account.id,
    balance: account.balance,
    creditLimit: account.creditData?.creditLimit ?? null,
  }));
}

export async function fetchItemConnectionInfo(itemId: string): Promise<PluggyItemConnectionInfo> {
  const client = getPluggyClient();
  const [item, accountsPage] = await Promise.all([client.fetchItem(itemId), client.fetchAccounts(itemId)]);
  return {
    status: item.status,
    accounts: accountsPage.results.map((account) => ({
      id: account.id,
      accountType: account.subtype,
      bank: normalizeBankName(account.name),
    })),
  };
}
