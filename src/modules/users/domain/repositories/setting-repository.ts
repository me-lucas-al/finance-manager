import type { NewSetting, Setting } from '../models/setting';

export type { NewSetting, Setting };

export interface SettingRepository {
  create(data: Omit<NewSetting, 'id'>): Promise<Setting>;
  findById(id: string): Promise<Setting | null>;
  update(id: string, data: Partial<NewSetting>): Promise<Setting>;
  delete(id: string): Promise<void>;
  findByUserId(userId: string): Promise<Setting | null>;
}
