import { definedOnly } from '@/tests/fakes/defined-only';
import { DuplicateFixedLaunchError } from '@/modules/finance/domain/models/fixed-launch-errors';
import type {
  NewTransaction,
  Transaction,
  TransactionFilters,
  TransactionRepository,
} from '@/modules/open-finance/domain/repositories/transaction-repository';

export class FakeTransactionRepository implements TransactionRepository {
  private items: Transaction[] = [];
  private idCounter = 1;

  async create(data: NewTransaction): Promise<Transaction> {
    const duplicate = this.items.some(
      (item) =>
        data.fixedEntryId &&
        item.fixedEntryId === data.fixedEntryId &&
        item.fixedReferenceMonth === data.fixedReferenceMonth
    );
    if (duplicate) throw new DuplicateFixedLaunchError();
    const item: Transaction = {
      ...data,
      fixedEntryId: data.fixedEntryId ?? null,
      fixedReferenceMonth: data.fixedReferenceMonth ?? null,
      id: String(this.idCounter++),
      source: data.source ?? 'manual',
      necessity: data.necessity ?? null,
      createdAt: new Date().toISOString(),
    };
    this.items.push(item);
    return item;
  }

  async findById(id: string): Promise<Transaction | null> {
    return this.items.find((item) => item.id === id) ?? null;
  }

  async findByPluggyId(pluggyTransactionId: string): Promise<Transaction | null> {
    return this.items.find((item) => item.pluggyTransactionId === pluggyTransactionId) ?? null;
  }

  async findByTelegramQuestionMessageId(userId: string, messageId: number): Promise<Transaction | null> {
    return this.items.find((item) => item.userId === userId && item.telegramQuestionMessageId === messageId) ?? null;
  }

  async findLatestPendingByUserId(userId: string): Promise<Transaction | null> {
    const matching = this.items
      .filter((item) => item.userId === userId && item.status === 'pending_reason')
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return matching[0] ?? null;
  }

  async findLatestEditableByUserId(userId: string): Promise<Transaction | null> {
    const matching = this.items
      .filter((item) => item.userId === userId && item.source === 'manual' && !item.fixedReferenceMonth)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return matching[0] ?? null;
  }

  async findAllByUserId(userId: string, filters?: TransactionFilters): Promise<Transaction[]> {
    return this.items.filter((item) => {
      if (item.userId !== userId) return false;
      if (filters?.source && item.source !== filters.source) return false;
      if (filters?.category && item.category !== filters.category) return false;
      if (filters?.month && !item.occurredAt.startsWith(filters.month)) return false;
      if (filters?.search && !item.description.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });
  }

  async countByUserId(
    userId: string,
    filters?: Pick<TransactionFilters, 'month' | 'category' | 'search'>
  ): Promise<number> {
    return (await this.findAllByUserId(userId, filters)).length;
  }

  async update(id: string, data: Partial<Omit<Transaction, 'id' | 'userId' | 'createdAt'>>): Promise<Transaction> {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) throw new Error('Not found');
    this.items[index] = { ...this.items[index], ...definedOnly(data) };
    return this.items[index];
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((item) => item.id !== id);
  }
}
