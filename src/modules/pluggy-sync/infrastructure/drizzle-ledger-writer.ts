import { sql } from 'drizzle-orm';
import { db } from '@/db';
import { holdings, incomes, investments } from '@/db/schema';
import type { HoldingInput, LedgerWriter } from '../domain/ledger-writer';

type IncomeInput = Parameters<LedgerWriter['addIncome']>[0];
type InvestmentInput = Parameters<LedgerWriter['addInvestment']>[0];

export class DrizzleLedgerWriter implements LedgerWriter {
  async addIncome(data: IncomeInput): Promise<boolean> {
    const inserted = await db
      .insert(incomes)
      .values({
        id: crypto.randomUUID(),
        userId: data.userId,
        periodId: data.periodId,
        externalId: data.externalId,
        amount: data.amount.toFixed(2),
        description: data.description,
        category: data.category,
        receivedAt: data.receivedAt,
      })
      .onConflictDoNothing()
      .returning({ id: incomes.id });
    return inserted.length > 0;
  }

  async addInvestment(data: InvestmentInput): Promise<boolean> {
    const inserted = await db
      .insert(investments)
      .values({
        id: crypto.randomUUID(),
        userId: data.userId,
        periodId: data.periodId,
        externalId: data.externalId,
        amount: data.amount.toFixed(2),
        description: data.description,
        type: data.type,
        date: data.date,
      })
      .onConflictDoNothing()
      .returning({ id: investments.id });
    return inserted.length > 0;
  }

  async upsertHolding(data: HoldingInput): Promise<void> {
    await db
      .insert(holdings)
      .values({
        id: crypto.randomUUID(),
        userId: data.userId,
        externalId: data.externalId,
        name: data.name,
        type: data.type,
        balance: data.balance.toFixed(2),
      })
      .onConflictDoUpdate({
        target: [holdings.userId, holdings.externalId],
        set: { name: data.name, type: data.type, balance: data.balance.toFixed(2), syncedAt: sql`now()` },
      });
  }
}
