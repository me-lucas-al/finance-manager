import { describe, it, expect, vi } from 'vitest';
import { createCardOptionsService } from '@/modules/finance/application/services/card-options-service';
import { makeCreditCard } from '@/tests/fakes/credit-card-fixture';

describe('card options for the entry form', () => {
  it('lists the cards as id, name and digits only', async () => {
    const listCards = vi.fn(async () => [makeCreditCard({ id: 'a', name: 'Nubank', lastDigits: '1234', creditLimit: 5000 })]);
    const options = createCardOptionsService({ listCards });

    expect(await options('user-1')).toEqual([{ id: 'a', name: 'Nubank', lastDigits: '1234' }]);
    expect(listCards).toHaveBeenCalledWith('user-1');
  });

  it('offers nothing when the user has no cards', async () => {
    const options = createCardOptionsService({ listCards: async () => [] });

    expect(await options('user-1')).toEqual([]);
  });
});
