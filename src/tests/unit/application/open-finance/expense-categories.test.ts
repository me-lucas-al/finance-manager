import { describe, expect, it } from 'vitest';
import { createExpenseCategoriesLister } from '@/modules/open-finance/application/shared/expense-categories';
import { FakeSettingRepository } from '@/tests/fakes/fake-setting-repository';

describe('createExpenseCategoriesLister', () => {
  it('returns the categories configured in the user settings', async () => {
    const settings = new FakeSettingRepository();
    await settings.create({ userId: 'user-1', expenseCategories: ['Mercado', 'Lazer'] });

    expect(await createExpenseCategoriesLister(settings)('user-1')).toEqual(['Mercado', 'Lazer']);
  });

  it('falls back to a default category when none is configured', async () => {
    const settings = new FakeSettingRepository();

    expect(await createExpenseCategoriesLister(settings)('user-1')).toEqual(['Outros']);
  });
});
