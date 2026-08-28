import type {
  NewTransaction,
  Transaction,
  TransactionFilters,
  TransactionRepository,
} from '../../../../modules/open-finance/domain/repositories/transaction-repository';

export class FakeTransactionRepository implements TransactionRepository {
  private items: Transaction[] = [];
  private idCounter = 1;

  async create(data: NewTransaction): Promise<Transaction> {
    const item: Transaction = { ...data, id: String(this.idCounter++), createdAt: new Date().toISOString() };
    this.items.push(item);
    return item;
  }

  async findById(id: string): Promise<Transaction | null> {
    return this.items.find((item) => item.id === id) ?? null;
  }

  async findByPluggyId(pluggyTransactionId: string): Promise<Transaction | null> {
    return this.items.find((item) => item.pluggyTransactionId === pluggyTransactionId) ?? null;
  }

  async findByTelegramQuestionMessageId(messageId: number): Promise<Transaction | null> {
    return this.items.find((item) => item.telegramQuestionMessageId === messageId) ?? null;
  }

  async findLatestPendingByUserId(userId: string): Promise<Transaction | null> {
    const matching = this.items
      .filter((item) => item.userId === userId && item.status === 'pending_reason')
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return matching[0] ?? null;
  }

  async findAllByUserId(userId: string, filters?: TransactionFilters): Promise<Transaction[]> {
    return this.items.filter((item) => {
      if (item.userId !== userId) return false;
      if (filters?.category && item.category !== filters.category) return false;
      if (filters?.month && !item.occurredAt.startsWith(filters.month)) return false;
      return true;
    });
  }

  async update(id: string, data: Partial<Omit<Transaction, 'id' | 'userId' | 'createdAt'>>): Promise<Transaction> {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) throw new Error('Not found');
    this.items[index] = { ...this.items[index], ...data };
    return this.items[index];
  }
}
