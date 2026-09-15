import { PluggyClient, Transaction as PluggyTransaction } from 'pluggy-sdk';

let client: PluggyClient | null = null;

// Lazy client: PluggyClient exchanges clientId/clientSecret for a short-lived API
// key internally on first request, so this only needs to be constructed once.
function getPluggyClient(): PluggyClient {
  if (client) return client;

  const clientId = process.env.PLUGGY_CLIENT_ID;
  const clientSecret = process.env.PLUGGY_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('Pluggy is not configured (missing PLUGGY_CLIENT_ID/PLUGGY_CLIENT_SECRET).');
  }

  client = new PluggyClient({ clientId, clientSecret });
  return client;
}

const BANK_KEYWORDS = ['itau', 'nubank', 'inter'];

function stripAccents(value: string): string {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

// Pluggy identifies the institution via item.connector.name (e.g. "Itaú",
// "Banco Inter"), not a fixed enum — this maps it to the bank keys the rest of
// the app expects (transactions.bank: itau/nubank/inter), falling back to the
// raw connector name for any other institution.
export function normalizeBankName(connectorName: string): string {
  const normalized = stripAccents(connectorName).toLowerCase();
  const match = BANK_KEYWORDS.find((keyword) => normalized.includes(keyword));
  return match ?? connectorName;
}

export async function fetchItemBankName(itemId: string): Promise<string> {
  const item = await getPluggyClient().fetchItem(itemId);
  return normalizeBankName(item.connector.name);
}

export async function fetchAccountType(accountId: string): Promise<string> {
  const account = await getPluggyClient().fetchAccount(accountId);
  return account.subtype;
}

export async function fetchTransactionDetails(transactionId: string): Promise<PluggyTransaction> {
  return getPluggyClient().fetchTransaction(transactionId);
}

export type PluggyItemConnectionInfo = {
  bank: string;
  status: string;
  accounts: { id: string; accountType: string }[];
};

// Called right after PluggyConnect's onSuccess so a connection is recorded even
// before any transaction webhook ever fires — without this, the only way to
// tell whether a bank is actually connected/syncing was to wait for a
// transaction to show up, which made a stalled or errored connection
// indistinguishable from "just hasn't synced yet".
export async function fetchItemConnectionInfo(itemId: string): Promise<PluggyItemConnectionInfo> {
  const client = getPluggyClient();
  const [item, accountsPage] = await Promise.all([client.fetchItem(itemId), client.fetchAccounts(itemId)]);
  return {
    bank: normalizeBankName(item.connector.name),
    status: item.status,
    accounts: accountsPage.results.map((account) => ({ id: account.id, accountType: account.subtype })),
  };
}

export async function fetchNewTransactions(
  accountId: string,
  createdAtFrom: string,
): Promise<PluggyTransaction[]> {
  return getPluggyClient().fetchAllTransactions(accountId, { createdAtFrom });
}

export async function getPluggyConnectToken(clientUserId?: string, itemId?: string): Promise<string> {
  const connectToken = await getPluggyClient().createConnectToken(
    itemId,
    clientUserId ? { clientUserId } : undefined,
  );
  return connectToken.accessToken;
}

