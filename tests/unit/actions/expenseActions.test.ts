import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createExpense, updateExpense, deleteExpense } from '../../../src/modules/expenses/presentation/actions/expenseActions';
import * as session from '../../../src/lib/session';

vi.mock('../../../src/lib/session', () => ({
  getSession: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  updateTag: vi.fn(),
}));

const mockCreateExpense = vi.fn();
const mockUpdateExpense = vi.fn();
const mockDeleteExpense = vi.fn();
const mockGetExpenseById = vi.fn();

vi.mock('../../../src/modules/expenses/application/useCases/ExpenseService', () => {
  return {
    ExpenseService: class MockExpenseService {
      createExpense = mockCreateExpense;
      updateExpense = mockUpdateExpense;
      deleteExpense = mockDeleteExpense;
      getExpenseById = mockGetExpenseById;
    },
  };
});

vi.mock('../../../src/modules/expenses/infra/repositories/ExpenseDrizzleRepository', () => {
  return {
    ExpenseDrizzleRepository: class MockExpenseDrizzleRepository {},
  };
});

describe('expenseActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createExpense', () => {
    it('should fail if user is not authenticated', async () => {
      vi.spyOn(session, 'getSession').mockResolvedValue(null);

      const result = await createExpense({
        periodId: '00000000-0000-0000-0000-000000000000',
        description: 'Test',
        amount: 100,
        category: 'food',
        date: new Date().toISOString(),
      });

      expect(result).toEqual({ error: 'Unauthorized' });
    });

    it('should create expense on success', async () => {
      vi.spyOn(session, 'getSession').mockResolvedValue({ userId: 'u1', expiresAt: new Date() });
      mockCreateExpense.mockResolvedValue({ id: 'e1' });

      const result = await createExpense({
        periodId: '00000000-0000-0000-0000-000000000000',
        description: 'Test',
        amount: 10000,
        category: 'food',
        date: new Date().toISOString(),
      });

      expect(result).toEqual({ success: true, data: { id: 'e1' } });
      expect(mockCreateExpense).toHaveBeenCalledWith(expect.objectContaining({
        userId: 'u1',
        amount: 10000,
      }));
    });
  });

  describe('updateExpense', () => {
    it('should fail if user is not the owner', async () => {
      vi.spyOn(session, 'getSession').mockResolvedValue({ userId: 'u1', expiresAt: new Date() });
      mockGetExpenseById.mockResolvedValue({ id: 'e1', userId: 'u2' }); 

      const result = await updateExpense('e1', { amount: 200 });
      expect(result).toEqual({ error: 'Unauthorized or Expense not found' });
    });

    it('should update expense if owner', async () => {
      vi.spyOn(session, 'getSession').mockResolvedValue({ userId: 'u1', expiresAt: new Date() });
      mockGetExpenseById.mockResolvedValue({ id: 'e1', userId: 'u1' });
      mockUpdateExpense.mockResolvedValue({ id: 'e1', amount: 200 });

      const result = await updateExpense('e1', { amount: 200 });
      expect(result).toEqual({ success: true, data: { id: 'e1', amount: 200 } });
    });
  });

  describe('deleteExpense', () => {
    it('should fail if user is not the owner', async () => {
      vi.spyOn(session, 'getSession').mockResolvedValue({ userId: 'u1', expiresAt: new Date() });
      mockGetExpenseById.mockResolvedValue({ id: 'e1', userId: 'u2' }); 

      const result = await deleteExpense('e1');
      expect(result).toEqual({ error: 'Unauthorized or Expense not found' });
    });

    it('should delete expense if owner', async () => {
      vi.spyOn(session, 'getSession').mockResolvedValue({ userId: 'u1', expiresAt: new Date() });
      mockGetExpenseById.mockResolvedValue({ id: 'e1', userId: 'u1' });
      mockDeleteExpense.mockResolvedValue(undefined);

      const result = await deleteExpense('e1');
      expect(result).toEqual({ success: true });
    });
  });
});
