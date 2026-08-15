import { describe, it, expect, beforeEach } from 'vitest';
import { CreateExpenseUseCase, GetExpenseUseCase, UpdateExpenseUseCase, DeleteExpenseUseCase } from '../../../../modules/finance/application/use-cases/manage-expense';
import { FakeExpenseRepository } from './fake-expense-repository';

describe('Manage Expense Use Cases', () => {
  let repo: FakeExpenseRepository;

  beforeEach(() => {
    repo = new FakeExpenseRepository();
  });

  it('should create and get Expense', async () => {
    const createUc = new CreateExpenseUseCase(repo);
    const getUc = new GetExpenseUseCase(repo);

    const created = await createUc.execute({ name: 'Test' });
    expect(created.id).toBeDefined();

    const fetched = await getUc.execute(created.id);
    expect(fetched?.id).toBe(created.id);
  });

  it('should update Expense', async () => {
    const createUc = new CreateExpenseUseCase(repo);
    const updateUc = new UpdateExpenseUseCase(repo);

    const created = await createUc.execute({ name: 'Test' });
    const updated = await updateUc.execute(created.id, { name: 'Updated' });

    expect(updated.name).toBe('Updated');
  });

  it('should delete Expense', async () => {
    const createUc = new CreateExpenseUseCase(repo);
    const deleteUc = new DeleteExpenseUseCase(repo);
    const getUc = new GetExpenseUseCase(repo);

    const created = await createUc.execute({ name: 'Test' });
    await deleteUc.execute(created.id);
    
    const fetched = await getUc.execute(created.id);
    expect(fetched).toBeNull();
  });
});