import { CreateCreditCardUseCase } from '@/modules/finance/application/credit-cards/create-credit-card';
import { CreditCardLinkGuard } from '@/modules/finance/application/credit-cards/credit-card-link-guard';
import { DeleteCreditCardUseCase } from '@/modules/finance/application/credit-cards/delete-credit-card';
import { ListCreditCardUsageUseCase } from '@/modules/finance/application/credit-cards/list-credit-card-usage';
import { ListCreditCardsUseCase } from '@/modules/finance/application/credit-cards/list-credit-cards';
import { UpdateCreditCardUseCase } from '@/modules/finance/application/credit-cards/update-credit-card';
import { DrizzleCreditCardRepository } from '@/modules/finance/infrastructure/drizzle-credit-card-repository';
import { NextEntryChangeNotifier } from '@/modules/finance/infrastructure/next-entry-change-notifier';
import { SupabaseCardSpendingSource } from '@/modules/finance/infrastructure/supabase-card-spending-source';

const notifier = new NextEntryChangeNotifier();

export const creditCardRepository = new DrizzleCreditCardRepository();
export const cardLinkGuard = new CreditCardLinkGuard(creditCardRepository);

export const listCreditCards = new ListCreditCardsUseCase(creditCardRepository);
export const listCreditCardUsage = new ListCreditCardUsageUseCase(creditCardRepository, new SupabaseCardSpendingSource());
export const createCreditCard = new CreateCreditCardUseCase(creditCardRepository, notifier);
export const updateCreditCard = new UpdateCreditCardUseCase(creditCardRepository, notifier);
export const deleteCreditCard = new DeleteCreditCardUseCase(creditCardRepository, notifier);
