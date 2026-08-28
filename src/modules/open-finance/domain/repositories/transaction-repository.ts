export type TransactionStatus = 'pending_reason' | 'categorized';

export type Transaction = {
  id: string;
  userId: string;
  pluggyTransactionId: string;
  accountId: string | null;
  bank: string;
  amount: number;
  description: string;
  occurredAt: string;
  category: string | null;
  categorySuggested: string | null;
  reason: string | null;
  status: TransactionStatus;
  telegramQuestionMessageId: number | null;
  createdAt: string;
};

export type NewTransaction = Omit<Transaction, 'id' | 'createdAt'>;

export type TransactionFilters = {
  month?: string;
  category?: string;
};

export interface TransactionRepository {
  create(data: NewTransaction): Promise<Transaction>;
  findById(id: string): Promise<Transaction | null>;
  findByPluggyId(pluggyTransactionId: string): Promise<Transaction | null>;
  findByTelegramQuestionMessageId(messageId: number): Promise<Transaction | null>;
  findLatestPendingByUserId(userId: string): Promise<Transaction | null>;
  findAllByUserId(userId: string, filters?: TransactionFilters): Promise<Transaction[]>;
  update(id: string, data: Partial<Omit<Transaction, 'id' | 'userId' | 'createdAt'>>): Promise<Transaction>;
}
