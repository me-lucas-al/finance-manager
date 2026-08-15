import { SettingRepository, NewSetting } from '../../domain/repositories/setting-repository';

export class CreateSettingUseCase {
  constructor(private repo: SettingRepository) {}
  async execute(data: Omit<NewSetting, 'id'>) {
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
  async execute(id: string, data: Partial<NewSetting>) {
    return this.repo.update(id, data);
  }
}
export class DeleteSettingUseCase {
  constructor(private repo: SettingRepository) {}
  async execute(id: string) {
    return this.repo.delete(id);
  }
}