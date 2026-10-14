import { sql } from 'drizzle-orm';

export const totalOverWindow = sql<number>`count(*) over()`;

export type RowWithTotal<Row> = { row: Row; total: number };

export function toPageWithTotal<Row>(rowsWithTotal: RowWithTotal<Row>[]) {
  return {
    rows: rowsWithTotal.map(({ row }) => row),
    total: Number(rowsWithTotal[0]?.total ?? 0),
  };
}
