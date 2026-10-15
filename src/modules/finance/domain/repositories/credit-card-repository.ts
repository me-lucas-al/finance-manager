import type { CreditCard } from '../models/credit-card';

export type NewCreditCard = Omit<CreditCard, 'id' | 'createdAt' | 'updatedAt'>;

export type CreditCardUpdate = Partial<Pick<CreditCard, 'name' | 'lastDigits' | 'creditLimit' | 'closingDay'>>;

export interface CreditCardRepository {
  create(data: NewCreditCard): Promise<CreditCard>;
  findById(userId: string, id: string): Promise<CreditCard | null>;
  findAllByUserId(userId: string): Promise<CreditCard[]>;
  update(userId: string, id: string, data: CreditCardUpdate): Promise<CreditCard>;
  delete(userId: string, id: string): Promise<void>;
}
