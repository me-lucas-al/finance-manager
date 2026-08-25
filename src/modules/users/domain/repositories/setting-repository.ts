import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import type { userSettings } from '@/db/schema';

export type Setting = InferSelectModel<typeof userSettings>;
export type NewSetting = InferInsertModel<typeof userSettings>;

export interface SettingRepository {
  create(data: Omit<NewSetting, 'id'>): Promise<Setting>;
  findById(id: string): Promise<Setting | null>;
  update(id: string, data: Partial<NewSetting>): Promise<Setting>;
  delete(id: string): Promise<void>;
  findByUserId(userId: string): Promise<Setting | null>;
}
