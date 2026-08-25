import { describe, it, expect, beforeEach } from 'vitest';
import { CreateInvestmentUseCase, GetInvestmentUseCase, UpdateInvestmentUseCase, DeleteInvestmentUseCase } from '../../../../modules/finance/application/use-cases/manage-investment';
import { FakeInvestmentRepository } from './fake-investment-repository';

const baseInvestment = {
  userId: 'user-1',
  periodId: 'period-1',
  description: 'Test',
  amount: '500.00',
  type: 'Renda Fixa',
  date: new Date('2026-09-20'),
};

describe('Manage Investment Use Cases', () => {
  let repo: FakeInvestmentRepository;

  beforeEach(() => {
    repo = new FakeInvestmentRepository();
  });

  it('should create and get Investment', async () => {
    const createUc = new CreateInvestmentUseCase(repo);
    const getUc = new GetInvestmentUseCase(repo);

    const created = await createUc.execute(baseInvestment);
    expect(created.id).toBeDefined();

    const fetched = await getUc.execute(created.id);
    expect(fetched?.id).toBe(created.id);
  });

  it('should update Investment', async () => {
    const createUc = new CreateInvestmentUseCase(repo);
    const updateUc = new UpdateInvestmentUseCase(repo);

    const created = await createUc.execute(baseInvestment);
    const updated = await updateUc.execute(created.id, { description: 'Updated' });

    expect(updated.description).toBe('Updated');
  });

  it('should delete Investment', async () => {
    const createUc = new CreateInvestmentUseCase(repo);
    const deleteUc = new DeleteInvestmentUseCase(repo);
    const getUc = new GetInvestmentUseCase(repo);

    const created = await createUc.execute(baseInvestment);
    await deleteUc.execute(created.id);

    const fetched = await getUc.execute(created.id);
    expect(fetched).toBeNull();
  });
});
