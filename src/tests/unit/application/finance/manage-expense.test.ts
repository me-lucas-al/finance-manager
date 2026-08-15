import { describe, it, expect, beforeEach } from 'vitest';
import { CreateExpenseUseCase, GetExpenseUseCase, UpdateExpenseUseCase, DeleteExpenseUseCase } from '../../../../modules/finance/application/use-cases/manage-expense';
import { FakeExpenseRepository } from './fake-expense-repository';

const baseExpense = {
  userId: 'user-1',
  periodId: 'period-1',
  description: 'Test',
  amount: '100.00',
  category: 'Moradia',
  date: new Date('2026-09-20'),
};

describe('Manage Expense Use Cases', () => {
  let repo: FakeExpenseRepository;

  beforeEach(() => {
    repo = new FakeExpenseRepository();
  });

  it('should create and get Expense', async () => {
    const createUc = new CreateExpenseUseCase(repo);
    const getUc = new GetExpenseUseCase(repo);

    const created = await createUc.execute(baseExpense);
    expect(created.id).toBeDefined();

    const fetched = await getUc.execute(created.id);
    expect(fetched?.id).toBe(created.id);
  });

  it('should update Expense', async () => {
    const createUc = new CreateExpenseUseCase(repo);
    const updateUc = new UpdateExpenseUseCase(repo);

    const created = await createUc.execute(baseExpense);
    const updated = await updateUc.execute(created.id, { description: 'Updated' });

    expect(updated.description).toBe('Updated');
  });

  it('should delete Expense', async () => {
    const createUc = new CreateExpenseUseCase(repo);
    const deleteUc = new DeleteExpenseUseCase(repo);
    const getUc = new GetExpenseUseCase(repo);

    const created = await createUc.execute(baseExpense);
    await deleteUc.execute(created.id);

    const fetched = await getUc.execute(created.id);
    expect(fetched).toBeNull();
  });
});
