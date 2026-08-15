export interface Investment {
  id: string;
  [key: string]: any;
}

export interface InvestmentRepository {
  create(data: Omit<Investment, 'id'>): Promise<Investment>;
  findById(id: string): Promise<Investment | null>;
  update(id: string, data: Partial<Investment>): Promise<Investment>;
  delete(id: string): Promise<void>;
  
}