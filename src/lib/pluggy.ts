import { PluggyClient, Transaction as PluggyTransaction } from 'pluggy-sdk';

let client: PluggyClient | null = null;

// Lazy client: PluggyClient exchanges clientId/clientSecret for a short-lived API
// key internally on first request, so this only needs to be constructed once.
export function getPluggyClient(): PluggyClient {
  if (client) return client;

  const clientId = process.env.PLUGGY_CLIENT_ID;
  const clientSecret = process.env.PLUGGY_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('Pluggy is not configured (missing PLUGGY_CLIENT_ID/PLUGGY_CLIENT_SECRET).');
  }

  client = new PluggyClient({ clientId, clientSecret });
  return client;
}

// Some accounts surface their institution via a legal/registered name rather
// than the everyday brand (e.g. Nubank's accounts are named after "Nu
// Pagamentos S.A."), so a bank can have more than one recognizable alias.
const BANK_ALIASES: [alias: string, bank: string][] = [
  ['itau', 'itau'],
  ['click', 'itau'],
  ['nubank', 'nubank'],
  ['nu pagamentos', 'nubank'],
  ['inter', 'inter'],
];

// Single source of truth for the display name of the banks normalizeBankName
// recognizes, shared with src/components/connections/bank-style.ts so the two
// layers don't drift into different labels for the same bank key.
export const KNOWN_BANK_NAMES: Record<string, string> = {
  itau: 'Itaú',
  nubank: 'Nubank',
  inter: 'Inter',
};

// For institutions normalizeBankName didn't recognize, the raw name is all
// we have — capitalize its first letter so it still reads as a proper noun.
export function bankDisplayName(bank: string): string {
  return KNOWN_BANK_NAMES[bank] ?? bank.charAt(0).toUpperCase() + bank.slice(1);
}

function stripAccents(value: string): string {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

// Pluggy identifies the institution via a connector or account name (e.g.
// "Itaú", "Banco Inter"), not a fixed enum — this maps it to the bank keys the
// rest of the app expects (transactions.bank: itau/nubank/inter), falling
// back to the raw name for any other institution.
export function normalizeBankName(name: string): string {
  const normalized = stripAccents(name).toLowerCase();
  const match = BANK_ALIASES.find(([alias]) => normalized.includes(alias));
  return match?.[1] ?? name;
}

// Bank identity is derived from the account's own name, not the item's
// connector — an aggregator connector (e.g. "MeuPluggy") wraps accounts from
// several different real institutions under one item, so the connector name
// alone can't tell them apart.
export async function fetchAccountInfo(accountId: string): Promise<{ bank: string; accountType: string }> {
  const account = await getPluggyClient().fetchAccount(accountId);
  return { bank: normalizeBankName(account.name), accountType: account.subtype };
}

export async function fetchTransactionDetails(transactionId: string): Promise<PluggyTransaction> {
  return getPluggyClient().fetchTransaction(transactionId);
}

export type PluggyItemConnectionInfo = {
  status: string;
  accounts: { id: string; accountType: string; bank: string }[];
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
    status: item.status,
    accounts: accountsPage.results.map((account) => ({
      id: account.id,
      accountType: account.subtype,
      bank: normalizeBankName(account.name),
    })),
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

