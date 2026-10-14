import { sql } from 'drizzle-orm';
import { db } from '@/db';
import { incomes, investments } from '@/db/schema';
import type { LedgerWriter } from '../domain/ledger-writer';

type InvestmentInput = Parameters<LedgerWriter['addInvestment']>[0];

function investmentRow(data: InvestmentInput) {
  return {
    id: crypto.randomUUID(),
    userId: data.userId,
    periodId: data.periodId,
    externalId: data.externalId,
    amount: data.amount.toFixed(2),
    description: data.description,
    type: data.type,
    date: data.date,
  };
}

export class DrizzleLedgerWriter implements LedgerWriter {
  async addIncome(data: Parameters<LedgerWriter['addIncome']>[0]): Promise<boolean> {
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
      .values(investmentRow(data))
      .onConflictDoNothing()
      .returning({ id: investments.id });
    return inserted.length > 0;
  }

  async upsertHolding(data: InvestmentInput): Promise<void> {
    await db
      .insert(investments)
      .values(investmentRow(data))
      .onConflictDoUpdate({
        target: [investments.userId, investments.externalId],
        set: {
          amount: data.amount.toFixed(2),
          periodId: data.periodId,
          date: data.date,
          updatedAt: sql`now()`,
        },
      });
  }
}
