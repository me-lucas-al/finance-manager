import { describe, it, expect, beforeEach } from 'vitest';
import { CreateUserUseCase, GetUserUseCase, UpdateUserUseCase, DeleteUserUseCase } from '../../../../modules/users/application/use-cases/manage-user';
import { FakeUserRepository } from './fake-user-repository';

const baseUser = { name: 'Test', email: 'test@example.com', passwordHash: 'hash' };

describe('Manage User Use Cases', () => {
  let repo: FakeUserRepository;

  beforeEach(() => {
    repo = new FakeUserRepository();
  });

  it('should create and get User', async () => {
    const createUc = new CreateUserUseCase(repo);
    const getUc = new GetUserUseCase(repo);

    const created = await createUc.execute(baseUser);
    expect(created.id).toBeDefined();

    const fetched = await getUc.execute(created.id);
    expect(fetched?.id).toBe(created.id);
  });

  it('should update User', async () => {
    const createUc = new CreateUserUseCase(repo);
    const updateUc = new UpdateUserUseCase(repo);

    const created = await createUc.execute(baseUser);
    const updated = await updateUc.execute(created.id, { name: 'Updated' });

    expect(updated.name).toBe('Updated');
  });

  it('should delete User', async () => {
    const createUc = new CreateUserUseCase(repo);
    const deleteUc = new DeleteUserUseCase(repo);
    const getUc = new GetUserUseCase(repo);

    const created = await createUc.execute(baseUser);
    await deleteUc.execute(created.id);

    const fetched = await getUc.execute(created.id);
    expect(fetched).toBeNull();
  });
});
