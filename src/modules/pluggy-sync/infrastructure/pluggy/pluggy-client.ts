import { PluggyClient } from 'pluggy-sdk';

let client: PluggyClient | null = null;

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
