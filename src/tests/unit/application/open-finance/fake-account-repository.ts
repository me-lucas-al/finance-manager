import type {
  Account,
  AccountRepository,
  NewAccount,
} from '../../../../modules/open-finance/domain/repositories/account-repository';

export class FakeAccountRepository implements AccountRepository {
  private items: Account[] = [];
  private idCounter = 1;

  async findByPluggyAccountId(pluggyAccountId: string): Promise<Account | null> {
    return this.items.find((item) => item.pluggyAccountId === pluggyAccountId) ?? null;
  }

  async findAllByPluggyItemId(pluggyItemId: string): Promise<Account[]> {
    return this.items.filter((item) => item.pluggyItemId === pluggyItemId);
  }

  async upsert(data: NewAccount): Promise<Account> {
    const index = this.items.findIndex((item) => item.pluggyAccountId === data.pluggyAccountId);
    if (index !== -1) {
      this.items[index] = { ...this.items[index], ...data };
      return this.items[index];
    }

    const item: Account = { ...data, id: String(this.idCounter++), createdAt: new Date().toISOString() };
    this.items.push(item);
    return item;
  }
}
