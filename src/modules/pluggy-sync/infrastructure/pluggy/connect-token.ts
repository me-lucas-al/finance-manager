import { getPluggyClient } from './pluggy-client';

export async function getPluggyConnectToken(clientUserId?: string, itemId?: string): Promise<string> {
  const connectToken = await getPluggyClient().createConnectToken(
    itemId,
    clientUserId ? { clientUserId } : undefined,
  );
  return connectToken.accessToken;
}
