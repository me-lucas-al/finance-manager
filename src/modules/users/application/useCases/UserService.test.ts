import { describe, it, expect, beforeEach } from 'vitest';
import { UserService } from './UserService';
import { IUserRepository, NewUser, User } from '../../domain/repositories/IUserRepository';

class MockUserRepository implements IUserRepository {
  private users: User[] = [];

  async create(data: NewUser): Promise<User> {
    const user: User = {
      id: data.id ?? Math.random().toString(),
      name: data.name,
      email: data.email,
      passwordHash: data.passwordHash,
      createdAt: data.createdAt ?? new Date(),
      updatedAt: data.updatedAt ?? new Date(),
    };
    this.users.push(user);
    return user;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.find((u) => u.id === id) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find((u) => u.email === email) || null;
  }

  async update(id: string, data: Partial<NewUser>): Promise<User> {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) throw new Error('User not found');
    this.users[index] = { ...this.users[index], ...data, updatedAt: new Date() };
    return this.users[index];
  }

  async delete(id: string): Promise<void> {
    this.users = this.users.filter((u) => u.id !== id);
  }

  async findAll(): Promise<User[]> {
    return this.users;
  }
}

describe('UserService', () => {
  let repository: MockUserRepository;
  let service: UserService;

  beforeEach(() => {
    repository = new MockUserRepository();
    service = new UserService(repository);
  });

  it('should create a user', async () => {
    const user = await service.createUser({
      name: 'John Doe',
      email: 'john@example.com',
      passwordHash: 'hashed_password',
    });

    expect(user).toHaveProperty('id');
    expect(user.name).toBe('John Doe');
  });

  it('should not create a user with duplicate email', async () => {
    await service.createUser({
      name: 'John Doe',
      email: 'john@example.com',
      passwordHash: 'hashed_password',
    });

    await expect(
      service.createUser({
        name: 'Jane Doe',
        email: 'john@example.com',
        passwordHash: 'other_hash',
      })
    ).rejects.toThrow('Email already exists');
  });

  it('should find user by id', async () => {
    const created = await service.createUser({
      name: 'John',
      email: 'john@example.com',
      passwordHash: '123',
    });

    const found = await service.getUserById(created.id);
    expect(found?.email).toBe('john@example.com');
  });

  it('should update user', async () => {
    const created = await service.createUser({
      name: 'John',
      email: 'john@example.com',
      passwordHash: '123',
    });

    const updated = await service.updateUser(created.id, { name: 'John Updated' });
    expect(updated.name).toBe('John Updated');
  });

  it('should delete user', async () => {
    const created = await service.createUser({
      name: 'John',
      email: 'john@example.com',
      passwordHash: '123',
    });

    await service.deleteUser(created.id);
    const found = await service.getUserById(created.id);
    expect(found).toBeNull();
  });
});
