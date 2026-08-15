export interface Period {
  id: string;
  [key: string]: any;
}

export interface PeriodRepository {
  create(data: Omit<Period, 'id'>): Promise<Period>;
  findById(id: string): Promise<Period | null>;
  update(id: string, data: Partial<Period>): Promise<Period>;
  delete(id: string): Promise<void>;
  
}