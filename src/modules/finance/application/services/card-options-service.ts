import type { CardOption, CreditCard } from '../../domain/models/credit-card';

export type CardOptionsDeps = {
  listCards: (userId: string) => Promise<CreditCard[]>;
};

export function createCardOptionsService({ listCards }: CardOptionsDeps) {
  return async (userId: string): Promise<CardOption[]> => {
    const cards = await listCards(userId);
    return cards.map(({ id, name, lastDigits }) => ({ id, name, lastDigits }));
  };
}
