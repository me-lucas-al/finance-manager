export interface Income {
  id: string;
  [key: string]: any;
}

export interface IncomeRepository {
  create(data: Omit<Income, 'id'>): Promise<Income>;
  findById(id: string): Promise<Income | null>;
  update(id: string, data: Partial<Income>): Promise<Income>;
  delete(id: string): Promise<void>;
  
}