import { describe, it, expect } from 'vitest';
import { buildFakeEntryServices } from '@/tests/fakes/build-fake-entry-services';

const entry = (type: 'expense' | 'income' | 'investment') => ({
  type,
  category: 'Geral',
  description: 'Item',
  amount: 10,
});

describe('registering entries stamps the current period', () => {
  it('stores period id and reference month on an expense', async () => {
    const { registerEntry, transactionRepo } = buildFakeEntryServices();

    await registerEntry.execute('user-1', entry('expense'));

    const [stored] = await transactionRepo.findAllByUserId('user-1');
    expect(stored.periodId).toEqual(expect.any(String));
    expect(stored.referenceMonth).toMatch(/^\d{4}-\d{2}$/);
  });

  it('stores the same reference month on an income and an investment', async () => {
    const { registerEntry, incomeRepo, investmentRepo } = buildFakeEntryServices();

    await registerEntry.execute('user-1', entry('income'));
    await registerEntry.execute('user-1', entry('investment'));

    expect(incomeRepo.items[0].referenceMonth).toMatch(/^\d{4}-\d{2}$/);
    expect(incomeRepo.items[0].referenceMonth).toBe(investmentRepo.items[0].referenceMonth);
  });
});
