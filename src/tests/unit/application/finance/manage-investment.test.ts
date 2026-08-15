import { describe, it, expect, beforeEach } from 'vitest';
import { CreateInvestmentUseCase, GetInvestmentUseCase, UpdateInvestmentUseCase, DeleteInvestmentUseCase } from '../../../../modules/finance/application/use-cases/manage-investment';
import { FakeInvestmentRepository } from './fake-investment-repository';

describe('Manage Investment Use Cases', () => {
  let repo: FakeInvestmentRepository;

  beforeEach(() => {
    repo = new FakeInvestmentRepository();
  });

  it('should create and get Investment', async () => {
    const createUc = new CreateInvestmentUseCase(repo);
    const getUc = new GetInvestmentUseCase(repo);

    const created = await createUc.execute({ name: 'Test' });
    expect(created.id).toBeDefined();

    const fetched = await getUc.execute(created.id);
    expect(fetched?.id).toBe(created.id);
  });

  it('should update Investment', async () => {
    const createUc = new CreateInvestmentUseCase(repo);
    const updateUc = new UpdateInvestmentUseCase(repo);

    const created = await createUc.execute({ name: 'Test' });
    const updated = await updateUc.execute(created.id, { name: 'Updated' });

    expect(updated.name).toBe('Updated');
  });

  it('should delete Investment', async () => {
    const createUc = new CreateInvestmentUseCase(repo);
    const deleteUc = new DeleteInvestmentUseCase(repo);
    const getUc = new GetInvestmentUseCase(repo);

    const created = await createUc.execute({ name: 'Test' });
    await deleteUc.execute(created.id);
    
    const fetched = await getUc.execute(created.id);
    expect(fetched).toBeNull();
  });
});