import { describe, it, expect, vi } from 'vitest';
import { createCardOptionsService } from '@/modules/finance/application/services/card-options-service';
import type { DataMode } from '@/modules/users/domain/models/user';
import { makeCreditCard } from '@/tests/fakes/credit-card-fixture';

function build(mode: DataMode | null) {
  const listCards = vi.fn(async () => [makeCreditCard({ id: 'a', name: 'Nubank', lastDigits: '1234' })]);
  return { options: createCardOptionsService({ readDataMode: async () => mode, listCards }), listCards };
}

describe('card options for the entry form', () => {
  it('lists the cards of a manual mode user as id, name and digits only', async () => {
    const { options } = build('manual');

    expect(await options('user-1')).toEqual([{ id: 'a', name: 'Nubank', lastDigits: '1234' }]);
  });

  it('offers nothing in pluggy mode or before choosing a mode', async () => {
    for (const mode of ['pluggy', null] as const) {
      const { options, listCards } = build(mode);

      expect(await options('user-1')).toEqual([]);
      expect(listCards).not.toHaveBeenCalled();
    }
  });
});
