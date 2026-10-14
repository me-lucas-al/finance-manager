import { describe, expect, it, vi } from 'vitest';

const findAllByUserId = vi.fn();
vi.mock('@/modules/open-finance/infrastructure/supabase-repositories', () => ({
  SupabaseTransactionRepository: class {
    findAllByUserId = findAllByUserId;
  },
}));

describe('getExpenseBreakdown', () => {
  it('sums stored expenses, which are always positive amounts', async () => {
    findAllByUserId.mockResolvedValue([
      { amount: 40, category: 'Mercado', categorySuggested: null },
      { amount: 10, category: 'Mercado', categorySuggested: null },
      { amount: 25, category: null, categorySuggested: 'Lazer' },
    ]);
    const { getExpenseBreakdown } = await import('@/modules/open-finance/application/shared/expense-totals');

    const result = await getExpenseBreakdown('user-1');

    expect(result.total).toBe(75);
    expect(result.byCategory).toEqual({ Mercado: 50, Lazer: 25 });
  });
});
