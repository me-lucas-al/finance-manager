import { describe, it, expect, beforeEach } from 'vitest';
import { CreateSettingUseCase, GetSettingUseCase, UpdateSettingUseCase, DeleteSettingUseCase } from '../../../../modules/users/application/use-cases/manage-setting';
import { FakeSettingRepository } from './fake-setting-repository';

const baseSetting = { userId: 'user-1' };

describe('Manage Setting Use Cases', () => {
  let repo: FakeSettingRepository;

  beforeEach(() => {
    repo = new FakeSettingRepository();
  });

  it('should create and get Setting', async () => {
    const createUc = new CreateSettingUseCase(repo);
    const getUc = new GetSettingUseCase(repo);

    const created = await createUc.execute(baseSetting);
    expect(created.id).toBeDefined();

    const fetched = await getUc.execute(created.id);
    expect(fetched?.id).toBe(created.id);
  });

  it('should update Setting', async () => {
    const createUc = new CreateSettingUseCase(repo);
    const updateUc = new UpdateSettingUseCase(repo);

    const created = await createUc.execute(baseSetting);
    const updated = await updateUc.execute(created.id, { periodStartDay: 20 });

    expect(updated.periodStartDay).toBe(20);
  });

  it('should delete Setting', async () => {
    const createUc = new CreateSettingUseCase(repo);
    const deleteUc = new DeleteSettingUseCase(repo);
    const getUc = new GetSettingUseCase(repo);

    const created = await createUc.execute(baseSetting);
    await deleteUc.execute(created.id);

    const fetched = await getUc.execute(created.id);
    expect(fetched).toBeNull();
  });
});
