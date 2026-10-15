import type { AdvisorCreditCardServices } from '@/modules/ai/application/tools/advisor-card-types';
import { createCreditCard, deleteCreditCard, listCreditCardUsage, updateCreditCard } from './credit-cards';
import { readDataMode } from './credit-card-views';

export const creditCardServices: AdvisorCreditCardServices = {
  readDataMode,
  list: listCreditCardUsage,
  create: createCreditCard,
  update: updateCreditCard,
  remove: deleteCreditCard,
};
