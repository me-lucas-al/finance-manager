import { SettingRepository } from '../../domain/repositories/setting-repository';

export class CreateSettingUseCase {
  constructor(private repo: SettingRepository) {}
  async execute(data: any) {
    return this.repo.create(data);
  }
}
export class GetSettingUseCase {
  constructor(private repo: SettingRepository) {}
  async execute(id: string) {
    return this.repo.findById(id);
  }
}
export class UpdateSettingUseCase {
  constructor(private repo: SettingRepository) {}
  async execute(id: string, data: any) {
    return this.repo.update(id, data);
  }
}
export class DeleteSettingUseCase {
  constructor(private repo: SettingRepository) {}
  async execute(id: string) {
    return this.repo.delete(id);
  }
}