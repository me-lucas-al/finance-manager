import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { userSettings } from '../../../../db/schema/userSettings';

export type UserSettings = InferSelectModel<typeof userSettings>;
export type NewUserSettings = InferInsertModel<typeof userSettings>;

export interface IUserSettingsRepository {
  create(data: NewUserSettings): Promise<UserSettings>;
  findByUserId(userId: string): Promise<UserSettings | null>;
  update(userId: string, data: Partial<NewUserSettings>): Promise<UserSettings>;
  delete(userId: string): Promise<void>;
}
