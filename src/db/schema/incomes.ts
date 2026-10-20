import { pgTable, text, timestamp, numeric, uniqueIndex, index, foreignKey } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from './users';
import { financialPeriods } from './financial-periods';
import { fixedEntries } from './fixed-entries';

export const incomes = pgTable('incomes', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  periodId: text('period_id').notNull().references(() => financialPeriods.id, { onDelete: 'cascade' }),
  description: text('description').notNull(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  category: text('category').notNull(),
  receivedAt: timestamp('received_at').notNull(),
  externalId: text('external_id'),
  fixedEntryId: text('fixed_entry_id'),
  fixedReferenceMonth: text('fixed_reference_month'),
  referenceMonth: text('reference_month'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    userIdIdx: index('incomes_user_id_idx').on(table.userId),
    periodIdIdx: index('incomes_period_id_idx').on(table.periodId),
    userPeriodDateIdx: index('incomes_user_period_date_idx').on(table.userId, table.periodId, table.receivedAt.desc()),
    externalIdIdx: uniqueIndex('incomes_user_external_id_idx').on(table.userId, table.externalId),
    fixedEntryMonthIdx: uniqueIndex('incomes_fixed_entry_month_uidx')
      .on(table.fixedEntryId, table.fixedReferenceMonth)
      .where(sql`${table.fixedEntryId} is not null`),
    fixedEntryOwnerFk: foreignKey({
      name: 'incomes_fixed_entry_owner_fk',
      columns: [table.fixedEntryId, table.userId],
      foreignColumns: [fixedEntries.id, fixedEntries.userId],
    }).onDelete('set null'),
  };
});
