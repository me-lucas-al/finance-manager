import { UserRepository } from '../../domain/repositories/user-repository';

export class CreateUserUseCase {
  constructor(private repo: UserRepository) {}
  async execute(data: any) {
    return this.repo.create(data);
  }
}
export class GetUserUseCase {
  constructor(private repo: UserRepository) {}
  async execute(id: string) {
    return this.repo.findById(id);
  }
}
export class UpdateUserUseCase {
  constructor(private repo: UserRepository) {}
  async execute(id: string, data: any) {
    return this.repo.update(id, data);
  }
}
export class DeleteUserUseCase {
  constructor(private repo: UserRepository) {}
  async execute(id: string) {
    return this.repo.delete(id);
  }
}