import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { holdings, userSettings } from '@/db/schema';
import type { AccountRepository } from '@/modules/open-finance/domain/repositories/account-repository';
import type { AccountBalance, Holding } from '../domain/models/portfolio';
import type { PortfolioSource } from '../domain/ports/portfolio-source';

export class PersistencePortfolioSource implements PortfolioSource {
  constructor(private readonly accounts: AccountRepository) {}

  async findHoldings(userId: string): Promise<Holding[]> {
    const rows = await db.select().from(holdings).where(eq(holdings.userId, userId));
    return rows.map((row) => ({ id: row.id, name: row.name, type: row.type, balance: Number(row.balance) }));
  }

  async findAccountBalances(userId: string): Promise<AccountBalance[]> {
    const accounts = await this.accounts.findAllByUserId(userId);
    return accounts.flatMap((account) =>
      account.balance === null
        ? []
        : [
            {
              id: account.id,
              bank: account.bank,
              accountType: account.accountType,
              balance: account.balance,
              creditLimit: account.creditLimit,
            },
          ],
    );
  }

  async findInitialBalance(userId: string): Promise<number> {
    const [row] = await db
      .select({ initialBalance: userSettings.initialBalance })
      .from(userSettings)
      .where(eq(userSettings.userId, userId));
    return Number(row?.initialBalance ?? 0);
  }
}
