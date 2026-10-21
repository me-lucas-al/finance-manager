import { KeyedMutex } from '@/shared/infrastructure/keyed-mutex';

export const sessionLock = new KeyedMutex();
