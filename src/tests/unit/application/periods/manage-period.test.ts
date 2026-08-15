import { describe, it, expect, beforeEach } from 'vitest';
import { CreatePeriodUseCase, GetPeriodUseCase, UpdatePeriodUseCase, DeletePeriodUseCase } from '../../../../modules/periods/application/use-cases/manage-period';
import { FakePeriodRepository } from './fake-period-repository';

describe('Manage Period Use Cases', () => {
  let repo: FakePeriodRepository;

  beforeEach(() => {
    repo = new FakePeriodRepository();
  });

  it('should create and get Period', async () => {
    const createUc = new CreatePeriodUseCase(repo);
    const getUc = new GetPeriodUseCase(repo);

    const created = await createUc.execute({ name: 'Test' });
    expect(created.id).toBeDefined();

    const fetched = await getUc.execute(created.id);
    expect(fetched?.id).toBe(created.id);
  });

  it('should update Period', async () => {
    const createUc = new CreatePeriodUseCase(repo);
    const updateUc = new UpdatePeriodUseCase(repo);

    const created = await createUc.execute({ name: 'Test' });
    const updated = await updateUc.execute(created.id, { name: 'Updated' });

    expect(updated.name).toBe('Updated');
  });

  it('should delete Period', async () => {
    const createUc = new CreatePeriodUseCase(repo);
    const deleteUc = new DeletePeriodUseCase(repo);
    const getUc = new GetPeriodUseCase(repo);

    const created = await createUc.execute({ name: 'Test' });
    await deleteUc.execute(created.id);
    
    const fetched = await getUc.execute(created.id);
    expect(fetched).toBeNull();
  });
});