import { describe, it, expect, beforeEach } from 'vitest';
import { EntryNotFoundError, EntryValidationError } from '@/modules/finance/domain/models/entry-errors';
import { makeCreditCard } from '@/tests/fakes/credit-card-fixture';
import { CARD_USER, createCreditCardHarness } from './credit-card-harness';

describe('credit card management', () => {
  let harness: ReturnType<typeof createCreditCardHarness>;

  beforeEach(() => {
    harness = createCreditCardHarness();
  });

  it('creates a card for the caller with trimmed name and null optionals', async () => {
    const card = await harness.create.execute(CARD_USER, { name: '  Nubank ', creditLimit: 3000 });

    expect(card).toMatchObject({ userId: CARD_USER, name: 'Nubank', lastDigits: null, closingDay: null, creditLimit: 3000 });
    expect(harness.notifier.notifyEntriesChanged).toHaveBeenCalledWith(CARD_USER);
  });

  it('rejects invalid cards without persisting', async () => {
    await expect(harness.create.execute(CARD_USER, { name: '', creditLimit: 10 })).rejects.toThrow(EntryValidationError);
    expect(harness.cards.items).toHaveLength(0);
  });

  it('updates only the given fields', async () => {
    harness.cards.items.push(makeCreditCard({ id: 'a', closingDay: 10 }));

    const updated = await harness.update.execute(CARD_USER, 'a', { creditLimit: 9000, closingDay: null });

    expect(updated).toMatchObject({ name: 'Nubank', creditLimit: 9000, closingDay: null });
  });

  it('refuses to update or delete cards from another user', async () => {
    harness.cards.items.push(makeCreditCard({ id: 'a' }));

    await expect(harness.update.execute('intruder', 'a', { name: 'X' })).rejects.toThrow(EntryNotFoundError);
    await expect(harness.remove.execute('intruder', 'a')).rejects.toThrow(EntryNotFoundError);
    expect(harness.cards.items).toHaveLength(1);
  });

  it('deletes an owned card and notifies', async () => {
    harness.cards.items.push(makeCreditCard({ id: 'a' }));

    await harness.remove.execute(CARD_USER, 'a');

    expect(harness.cards.items).toHaveLength(0);
    expect(harness.notifier.notifyEntriesChanged).toHaveBeenCalledWith(CARD_USER);
  });
});
