import type { AdvisorCreditCardServices } from '@/modules/ai/application/tools/advisor-card-types';
import { ShowCreditCardsUseCase } from '@/modules/finance/application/credit-cards/show-credit-cards';
import type { CardNameSource } from '@/modules/finance/domain/ports/card-name-source';
import { createCreditCard, deleteCreditCard, listCreditCardUsage, updateCreditCard } from './credit-cards';
import { listCardOptions, readDataMode } from './credit-card-views';

export const showCreditCards = new ShowCreditCardsUseCase(readDataMode, listCreditCardUsage);

export const cardNameSource: CardNameSource = {
  listCardNames: async (userId) => (await listCardOptions(userId)).map((card) => card.name),
};

export const creditCardServices: AdvisorCreditCardServices = {
  readDataMode,
  list: listCreditCardUsage,
  create: createCreditCard,
  update: updateCreditCard,
  remove: deleteCreditCard,
};
