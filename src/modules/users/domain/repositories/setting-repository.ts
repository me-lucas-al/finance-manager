export interface Setting {
  id: string;
  [key: string]: any;
}

export interface SettingRepository {
  create(data: Omit<Setting, 'id'>): Promise<Setting>;
  findById(id: string): Promise<Setting | null>;
  update(id: string, data: Partial<Setting>): Promise<Setting>;
  delete(id: string): Promise<void>;
  findByUserId(userId: string): Promise<Setting | null>;
}