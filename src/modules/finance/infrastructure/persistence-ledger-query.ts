import { sql, type SQL } from 'drizzle-orm';
import { db } from '@/db';
import type { LedgerKind } from '../domain/models/ledger-entry';
import type { LedgerQuery, LedgerScope, LedgerSearch } from '../domain/ports/ledger-query';
import {
  toCategoryTotals,
  toLedgerEntry,
  toLedgerTotals,
  type CategoryTotalRow,
  type KindTotalRow,
  type LedgerEntryRow,
} from './ledger-query-rows';

const escapeLike = (text: string): string => text.replace(/[\\%_]/g, '\\$&');

function scopeConditions(userId: string, scope: LedgerScope): SQL[] {
  const conditions = [sql`user_id = ${userId}`];
  if (scope.periodId) conditions.push(sql`period_id = ${scope.periodId}`);
  if (scope.manualOnly) conditions.push(sql`source = 'manual'`);
  return conditions;
}

function searchConditions(userId: string, filter: LedgerSearch): SQL[] {
  const conditions = scopeConditions(userId, filter);
  if (filter.kind) conditions.push(sql`kind = ${filter.kind}`);
  if (filter.category) conditions.push(sql`lower(category) = lower(${filter.category})`);
  if (filter.text?.trim()) {
    const pattern = `%${escapeLike(filter.text.trim())}%`;
    conditions.push(sql`(description ilike ${pattern} or category ilike ${pattern})`);
  }
  return conditions;
}

const allOf = (conditions: SQL[]): SQL => sql.join(conditions, sql` and `);

export class PersistenceLedgerQuery implements LedgerQuery {
  async totals(userId: string, scope: LedgerScope) {
    const rows = await db.execute<KindTotalRow>(sql`
      select kind, coalesce(sum(amount), 0)::float8 as total
      from ledger_view where ${allOf(scopeConditions(userId, scope))} group by kind`);
    return toLedgerTotals([...rows]);
  }

  async totalsByCategory(userId: string, kind: LedgerKind, scope: LedgerScope) {
    const conditions = [...scopeConditions(userId, scope), sql`kind = ${kind}`];
    const rows = await db.execute<CategoryTotalRow>(sql`
      select category, sum(amount)::float8 as total
      from ledger_view where ${allOf(conditions)} group by category order by total desc`);
    return toCategoryTotals([...rows]);
  }

  async search(userId: string, filter: LedgerSearch) {
    const rows = await db.execute<LedgerEntryRow>(sql`
      select id, kind, to_char(date, 'YYYY-MM-DD') as date, description, category, amount::float8 as amount, source
      from ledger_view where ${allOf(searchConditions(userId, filter))}
      order by date desc, id asc limit ${filter.limit}`);
    return [...rows].map(toLedgerEntry);
  }
}
