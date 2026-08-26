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

export async function fetchNewTransactions(
  accountId: string,
  createdAtFrom: string,
): Promise<PluggyTransaction[]> {
  return getPluggyClient().fetchAllTransactions(accountId, { createdAtFrom });
}
