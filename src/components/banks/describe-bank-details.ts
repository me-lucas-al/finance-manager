import { toLocalDateString } from '@/lib/month';
import type { ConnectedBank } from '@/modules/open-finance/domain/connected-bank';

const formatDay = (isoTimestamp: string): string => {
  const [year, month, day] = toLocalDateString(new Date(isoTimestamp)).split('-');
  return `${day}/${month}/${year}`;
};

export function describeBankDetails({ accountCount, lastSyncedAt }: ConnectedBank): string {
  const accounts = accountCount === 1 ? '1 conta' : `${accountCount} contas`;
  return lastSyncedAt ? `${accounts} · atualizado em ${formatDay(lastSyncedAt)}` : accounts;
}
