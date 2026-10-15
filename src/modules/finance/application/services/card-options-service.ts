import type { DataMode } from '@/modules/users/domain/models/user';
import type { CardOption, CreditCard } from '../../domain/models/credit-card';

export type CardOptionsDeps = {
  readDataMode: (userId: string) => Promise<DataMode | null>;
  listCards: (userId: string) => Promise<CreditCard[]>;
};

export function createCardOptionsService({ readDataMode, listCards }: CardOptionsDeps) {
  return async (userId: string): Promise<CardOption[]> => {
    if ((await readDataMode(userId)) !== 'manual') return [];
    const cards = await listCards(userId);
    return cards.map(({ id, name, lastDigits }) => ({ id, name, lastDigits }));
  };
}
