export interface User {
  id: string;
  [key: string]: any;
}

export interface UserRepository {
  create(data: Omit<User, 'id'>): Promise<User>;
  findById(id: string): Promise<User | null>;
  update(id: string, data: Partial<User>): Promise<User>;
  delete(id: string): Promise<void>;
  
}