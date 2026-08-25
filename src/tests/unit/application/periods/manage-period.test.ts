import { describe, it, expect, beforeEach } from 'vitest';
import { CreatePeriodUseCase, GetPeriodUseCase, UpdatePeriodUseCase, DeletePeriodUseCase } from '../../../../modules/periods/application/use-cases/manage-period';
import { FakePeriodRepository } from './fake-period-repository';

const basePeriod = {
  userId: 'user-1',
  startDate: new Date('2026-09-15'),
  endDate: new Date('2026-10-14'),
  status: 'OPEN',
};

describe('Manage Period Use Cases', () => {
  let repo: FakePeriodRepository;

  beforeEach(() => {
    repo = new FakePeriodRepository();
  });

  it('should create and get Period', async () => {
    const createUc = new CreatePeriodUseCase(repo);
    const getUc = new GetPeriodUseCase(repo);

    const created = await createUc.execute(basePeriod);
    expect(created.id).toBeDefined();

    const fetched = await getUc.execute(created.id);
    expect(fetched?.id).toBe(created.id);
  });

  it('should update Period', async () => {
    const createUc = new CreatePeriodUseCase(repo);
    const updateUc = new UpdatePeriodUseCase(repo);

    const created = await createUc.execute(basePeriod);
    const updated = await updateUc.execute(created.id, { status: 'CLOSED' });

    expect(updated.status).toBe('CLOSED');
  });

  it('should delete Period', async () => {
    const createUc = new CreatePeriodUseCase(repo);
    const deleteUc = new DeletePeriodUseCase(repo);
    const getUc = new GetPeriodUseCase(repo);

    const created = await createUc.execute(basePeriod);
    await deleteUc.execute(created.id);

    const fetched = await getUc.execute(created.id);
    expect(fetched).toBeNull();
  });
});
