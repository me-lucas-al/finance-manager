import { vi } from 'vitest';
import { CreateCreditCardUseCase } from '@/modules/finance/application/credit-cards/create-credit-card';
import { DeleteCreditCardUseCase } from '@/modules/finance/application/credit-cards/delete-credit-card';
import { ListCreditCardUsageUseCase } from '@/modules/finance/application/credit-cards/list-credit-card-usage';
import { UpdateCreditCardUseCase } from '@/modules/finance/application/credit-cards/update-credit-card';
import type { CardExpense } from '@/modules/finance/domain/models/credit-card';
import { FakeCreditCardRepository } from '@/tests/fakes/fake-credit-card-repository';

export const CARD_USER = 'user-1';

export function createCreditCardHarness() {
  const cards = new FakeCreditCardRepository();
  const notifier = { notifyEntriesChanged: vi.fn(async () => {}) };
  const expenses: CardExpense[] = [];
  const spending = { listCardExpenses: vi.fn(async () => expenses) };
  const clock = () => new Date('2026-10-15T15:00:00Z');

  return {
    cards,
    notifier,
    expenses,
    spending,
    create: new CreateCreditCardUseCase(cards, notifier),
    update: new UpdateCreditCardUseCase(cards, notifier),
    remove: new DeleteCreditCardUseCase(cards, notifier),
    usage: new ListCreditCardUsageUseCase(cards, spending, clock),
  };
}
