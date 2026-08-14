import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createIncome, updateIncome, deleteIncome } from '../../../src/modules/incomes/presentation/actions/incomeActions';
import * as session from '../../../src/lib/session';

// Mock getSession
vi.mock('../../../src/lib/session', () => ({
  getSession: vi.fn(),
}));

// Mock next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  updateTag: vi.fn(),
}));

// Mock the service
const mockCreateIncome = vi.fn();
const mockUpdateIncome = vi.fn();
const mockDeleteIncome = vi.fn();
const mockGetIncomeById = vi.fn();

vi.mock('../../../src/modules/incomes/application/useCases/IncomeService', () => {
  return {
    IncomeService: class MockIncomeService {
      createIncome = mockCreateIncome;
      updateIncome = mockUpdateIncome;
      deleteIncome = mockDeleteIncome;
      getIncomeById = mockGetIncomeById;
    },
  };
});

// Mock the repository to pass to the service in the action (though it's mocked via IncomeService constructor usually)
vi.mock('../../../src/modules/incomes/infra/repositories/IncomeDrizzleRepository', () => {
  return {
    IncomeDrizzleRepository: class MockIncomeDrizzleRepository {},
  };
});

describe('incomeActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createIncome', () => {
    it('should fail if user is not authenticated', async () => {
      vi.spyOn(session, 'getSession').mockResolvedValue(null);

      const result = await createIncome({
        periodId: '00000000-0000-0000-0000-000000000000',
        description: 'Test',
        amount: 100,
        category: 'salary',
        receivedAt: new Date().toISOString(),
      });

      expect(result).toEqual({ error: 'Unauthorized' });
    });

    it('should fail if input is invalid', async () => {
      vi.spyOn(session, 'getSession').mockResolvedValue({ userId: 'u1', expiresAt: new Date() });

      const result = await createIncome({
        periodId: '', // invalid
        description: 'Test',
        amount: -100, // invalid
        category: 'salary',
        receivedAt: 'not a date', // invalid
      });

      expect(result).toHaveProperty('error');
      expect(result.error).toContain('Validation Error');
    });

    it('should create income and revalidate path on success', async () => {
      vi.spyOn(session, 'getSession').mockResolvedValue({ userId: 'u1', expiresAt: new Date() });
      mockCreateIncome.mockResolvedValue({ id: 'i1' });

      const result = await createIncome({
        periodId: '00000000-0000-0000-0000-000000000000',
        description: 'Test',
        amount: 10000,
        category: 'salary',
        receivedAt: new Date().toISOString(),
      });

      expect(result).toEqual({ success: true, data: { id: 'i1' } });
      expect(mockCreateIncome).toHaveBeenCalledWith(expect.objectContaining({
        userId: 'u1',
        periodId: '00000000-0000-0000-0000-000000000000',
        amount: 10000,
      }));
    });
  });

  describe('updateIncome', () => {
    it('should fail if user is not the owner', async () => {
      vi.spyOn(session, 'getSession').mockResolvedValue({ userId: 'u1', expiresAt: new Date() });
      mockGetIncomeById.mockResolvedValue({ id: 'i1', userId: 'u2' }); // Not owner

      const result = await updateIncome('i1', { amount: 200 });
      expect(result).toEqual({ error: 'Unauthorized or Income not found' });
    });

    it('should update income if owner', async () => {
      vi.spyOn(session, 'getSession').mockResolvedValue({ userId: 'u1', expiresAt: new Date() });
      mockGetIncomeById.mockResolvedValue({ id: 'i1', userId: 'u1' });
      mockUpdateIncome.mockResolvedValue({ id: 'i1', amount: 200 });

      const result = await updateIncome('i1', { amount: 200 });
      expect(result).toEqual({ success: true, data: { id: 'i1', amount: 200 } });
      expect(mockUpdateIncome).toHaveBeenCalledWith('i1', 'u1', { amount: 200 });
    });
  });

  describe('deleteIncome', () => {
    it('should fail if user is not the owner', async () => {
      vi.spyOn(session, 'getSession').mockResolvedValue({ userId: 'u1', expiresAt: new Date() });
      mockGetIncomeById.mockResolvedValue({ id: 'i1', userId: 'u2' }); // Not owner

      const result = await deleteIncome('i1');
      expect(result).toEqual({ error: 'Unauthorized or Income not found' });
    });

    it('should delete income if owner', async () => {
      vi.spyOn(session, 'getSession').mockResolvedValue({ userId: 'u1', expiresAt: new Date() });
      mockGetIncomeById.mockResolvedValue({ id: 'i1', userId: 'u1' });
      mockDeleteIncome.mockResolvedValue(undefined);

      const result = await deleteIncome('i1');
      expect(result).toEqual({ success: true });
      expect(mockDeleteIncome).toHaveBeenCalledWith('i1', 'u1');
    });
  });
});
