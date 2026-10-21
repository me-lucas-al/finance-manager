import {
  BufferJSON,
  initAuthCreds,
  proto,
  type AuthenticationCreds,
  type AuthenticationState,
  type SignalDataTypeMap,
} from '@whiskeysockets/baileys';
import type { WhatsappAuthStore } from '../domain/whatsapp-auth-store';

const CREDS_NAME = 'creds';

type KeyType = keyof SignalDataTypeMap;
type KeyValues<T extends KeyType> = { [id: string]: SignalDataTypeMap[T] };

const keyName = (type: string, id: string): string => `${type}-${id}`.replace(/\//g, '__').replace(/:/g, '-');
const serialize = (value: unknown): string => JSON.stringify(value, BufferJSON.replacer);
const deserialize = (raw: string): unknown => JSON.parse(raw, BufferJSON.reviver);

function revive<T extends KeyType>(type: T, raw: string): SignalDataTypeMap[T] {
  const value = deserialize(raw);
  if (type !== 'app-state-sync-key') return value as SignalDataTypeMap[T];
  return proto.Message.AppStateSyncKeyData.create(value as object) as unknown as SignalDataTypeMap[T];
}

export type LoadedAuthState = { state: AuthenticationState; saveCreds: () => Promise<void> };

export async function loadAuthState(store: WhatsappAuthStore, userId: string): Promise<LoadedAuthState> {
  const saved = (await store.readMany(userId, [CREDS_NAME]))[CREDS_NAME];
  const creds = (saved ? deserialize(saved) : initAuthCreds()) as AuthenticationCreds;

  const keys: AuthenticationState['keys'] = {
    get: async <T extends KeyType>(type: T, ids: string[]) => {
      const stored = await store.readMany(userId, ids.map((id) => keyName(type, id)));
      const found: KeyValues<T> = {};
      for (const id of ids) {
        const raw = stored[keyName(type, id)];
        if (raw) found[id] = revive(type, raw);
      }
      return found;
    },
    set: async (data) => {
      const entries: Record<string, string | null> = {};
      for (const type of Object.keys(data) as KeyType[]) {
        for (const [id, value] of Object.entries(data[type] ?? {})) {
          entries[keyName(type, id)] = value ? serialize(value) : null;
        }
      }
      await store.write(userId, entries);
    },
  };

  return {
    state: { creds, keys },
    saveCreds: () => store.write(userId, { [CREDS_NAME]: serialize(creds) }),
  };
}
