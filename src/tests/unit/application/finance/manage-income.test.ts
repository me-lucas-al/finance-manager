import { describe, it, expect, beforeEach } from 'vitest';
import { CreateIncomeUseCase, GetIncomeUseCase, UpdateIncomeUseCase, DeleteIncomeUseCase } from '../../../../modules/finance/application/use-cases/manage-income';
import { FakeIncomeRepository } from './fake-income-repository';

const baseIncome = {
  userId: 'user-1',
  periodId: 'period-1',
  description: 'Test',
  amount: '5000.00',
  category: 'Salário',
  receivedAt: new Date('2026-09-20'),
};

describe('Manage Income Use Cases', () => {
  let repo: FakeIncomeRepository;

  beforeEach(() => {
    repo = new FakeIncomeRepository();
  });

  it('should create and get Income', async () => {
    const createUc = new CreateIncomeUseCase(repo);
    const getUc = new GetIncomeUseCase(repo);

    const created = await createUc.execute(baseIncome);
    expect(created.id).toBeDefined();

    const fetched = await getUc.execute(created.id);
    expect(fetched?.id).toBe(created.id);
  });

  it('should update Income', async () => {
    const createUc = new CreateIncomeUseCase(repo);
    const updateUc = new UpdateIncomeUseCase(repo);

    const created = await createUc.execute(baseIncome);
    const updated = await updateUc.execute(created.id, { description: 'Updated' });

    expect(updated.description).toBe('Updated');
  });

  it('should delete Income', async () => {
    const createUc = new CreateIncomeUseCase(repo);
    const deleteUc = new DeleteIncomeUseCase(repo);
    const getUc = new GetIncomeUseCase(repo);

    const created = await createUc.execute(baseIncome);
    await deleteUc.execute(created.id);

    const fetched = await getUc.execute(created.id);
    expect(fetched).toBeNull();
  });
});
