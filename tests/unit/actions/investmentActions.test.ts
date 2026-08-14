import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createInvestment, updateInvestment, deleteInvestment } from '../../../src/modules/investments/presentation/actions/investmentActions';
import * as session from '../../../src/lib/session';

vi.mock('../../../src/lib/session', () => ({
  getSession: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

const mockCreateInvestment = vi.fn();
const mockUpdateInvestment = vi.fn();
const mockDeleteInvestment = vi.fn();
const mockGetInvestmentById = vi.fn();

vi.mock('../../../src/modules/investments/application/useCases/InvestmentService', () => {
  return {
    InvestmentService: class MockInvestmentService {
      createInvestment = mockCreateInvestment;
      updateInvestment = mockUpdateInvestment;
      deleteInvestment = mockDeleteInvestment;
      getInvestmentById = mockGetInvestmentById;
    },
  };
});

vi.mock('../../../src/modules/investments/infra/repositories/InvestmentDrizzleRepository', () => {
  return {
    InvestmentDrizzleRepository: class MockInvestmentDrizzleRepository {},
  };
});

describe('investmentActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createInvestment', () => {
    it('should fail if user is not authenticated', async () => {
      vi.spyOn(session, 'getSession').mockResolvedValue(null);

      const result = await createInvestment({
        periodId: '00000000-0000-0000-0000-000000000000',
        description: 'Test',
        amount: 100,
        type: 'stocks',
        date: new Date().toISOString(),
      });

      expect(result).toEqual({ error: 'Unauthorized' });
    });

    it('should create investment on success', async () => {
      vi.spyOn(session, 'getSession').mockResolvedValue({ userId: 'u1', expiresAt: new Date() });
      mockCreateInvestment.mockResolvedValue({ id: 'inv1' });

      const result = await createInvestment({
        periodId: '00000000-0000-0000-0000-000000000000',
        description: 'Test',
        amount: 10000,
        type: 'stocks',
        date: new Date().toISOString(),
      });

      expect(result).toEqual({ success: true, data: { id: 'inv1' } });
    });
  });

  describe('updateInvestment', () => {
    it('should fail if user is not the owner', async () => {
      vi.spyOn(session, 'getSession').mockResolvedValue({ userId: 'u1', expiresAt: new Date() });
      mockGetInvestmentById.mockResolvedValue({ id: 'inv1', userId: 'u2' }); 

      const result = await updateInvestment('inv1', { amount: 200 });
      expect(result).toEqual({ error: 'Unauthorized or Investment not found' });
    });

    it('should update investment if owner', async () => {
      vi.spyOn(session, 'getSession').mockResolvedValue({ userId: 'u1', expiresAt: new Date() });
      mockGetInvestmentById.mockResolvedValue({ id: 'inv1', userId: 'u1' });
      mockUpdateInvestment.mockResolvedValue({ id: 'inv1', amount: 200 });

      const result = await updateInvestment('inv1', { amount: 200 });
      expect(result).toEqual({ success: true, data: { id: 'inv1', amount: 200 } });
    });
  });

  describe('deleteInvestment', () => {
    it('should fail if user is not the owner', async () => {
      vi.spyOn(session, 'getSession').mockResolvedValue({ userId: 'u1', expiresAt: new Date() });
      mockGetInvestmentById.mockResolvedValue({ id: 'inv1', userId: 'u2' }); 

      const result = await deleteInvestment('inv1');
      expect(result).toEqual({ error: 'Unauthorized or Investment not found' });
    });

    it('should delete investment if owner', async () => {
      vi.spyOn(session, 'getSession').mockResolvedValue({ userId: 'u1', expiresAt: new Date() });
      mockGetInvestmentById.mockResolvedValue({ id: 'inv1', userId: 'u1' });
      mockDeleteInvestment.mockResolvedValue(undefined);

      const result = await deleteInvestment('inv1');
      expect(result).toEqual({ success: true });
    });
  });
});
