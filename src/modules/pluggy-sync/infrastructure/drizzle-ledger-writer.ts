import { and, eq, notInArray, sql } from 'drizzle-orm';
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

  async replaceItemHoldings(userId: string, itemId: string, positions: HoldingInput[]): Promise<void> {
    await db.transaction(async (tx) => {
      for (const data of positions) {
        await tx
          .insert(holdings)
          .values({
            id: crypto.randomUUID(),
            userId,
            itemId,
            externalId: data.externalId,
            name: data.name,
            type: data.type,
            balance: data.balance.toFixed(2),
          })
          .onConflictDoUpdate({
            target: [holdings.userId, holdings.externalId],
            set: { itemId, name: data.name, type: data.type, balance: data.balance.toFixed(2), syncedAt: sql`now()` },
          });
      }
      const ofItem = and(eq(holdings.userId, userId), eq(holdings.itemId, itemId));
      const keptIds = positions.map((position) => position.externalId);
      const stale = keptIds.length > 0 ? and(ofItem, notInArray(holdings.externalId, keptIds)) : ofItem;
      await tx.delete(holdings).where(stale);
    });
  }
}
