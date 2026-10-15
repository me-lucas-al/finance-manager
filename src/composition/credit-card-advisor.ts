import type { AdvisorCreditCardServices } from '@/modules/ai/application/tools/advisor-card-types';
import { ShowCreditCardsUseCase } from '@/modules/finance/application/credit-cards/show-credit-cards';
import { createCreditCard, deleteCreditCard, listCreditCardUsage, updateCreditCard } from './credit-cards';
import { readDataMode } from './credit-card-views';

export const showCreditCards = new ShowCreditCardsUseCase(readDataMode, listCreditCardUsage);

export const creditCardServices: AdvisorCreditCardServices = {
  readDataMode,
  list: listCreditCardUsage,
  create: createCreditCard,
  update: updateCreditCard,
  remove: deleteCreditCard,
};
