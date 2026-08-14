import { IUserRepository, NewUser, User } from '../../domain/repositories/IUserRepository';

export class UserService {
  constructor(private readonly userRepository: IUserRepository) {}

  async createUser(data: NewUser): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error('Email already exists');
    }
    return this.userRepository.create(data);
  }

  async getUserById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async updateUser(id: string, data: Partial<NewUser>): Promise<User> {
    return this.userRepository.update(id, data);
  }

  async deleteUser(id: string): Promise<void> {
    return this.userRepository.delete(id);
  }

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.findAll();
  }
}
