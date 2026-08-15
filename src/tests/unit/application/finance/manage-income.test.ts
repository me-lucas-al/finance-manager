import { describe, it, expect, beforeEach } from 'vitest';
import { CreateIncomeUseCase, GetIncomeUseCase, UpdateIncomeUseCase, DeleteIncomeUseCase } from '../../../../modules/finance/application/use-cases/manage-income';
import { FakeIncomeRepository } from './fake-income-repository';

describe('Manage Income Use Cases', () => {
  let repo: FakeIncomeRepository;

  beforeEach(() => {
    repo = new FakeIncomeRepository();
  });

  it('should create and get Income', async () => {
    const createUc = new CreateIncomeUseCase(repo);
    const getUc = new GetIncomeUseCase(repo);

    const created = await createUc.execute({ name: 'Test' });
    expect(created.id).toBeDefined();

    const fetched = await getUc.execute(created.id);
    expect(fetched?.id).toBe(created.id);
  });

  it('should update Income', async () => {
    const createUc = new CreateIncomeUseCase(repo);
    const updateUc = new UpdateIncomeUseCase(repo);

    const created = await createUc.execute({ name: 'Test' });
    const updated = await updateUc.execute(created.id, { name: 'Updated' });

    expect(updated.name).toBe('Updated');
  });

  it('should delete Income', async () => {
    const createUc = new CreateIncomeUseCase(repo);
    const deleteUc = new DeleteIncomeUseCase(repo);
    const getUc = new GetIncomeUseCase(repo);

    const created = await createUc.execute({ name: 'Test' });
    await deleteUc.execute(created.id);
    
    const fetched = await getUc.execute(created.id);
    expect(fetched).toBeNull();
  });
});