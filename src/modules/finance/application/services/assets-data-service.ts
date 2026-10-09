import { getEffectiveUserId } from '@/app/actions/require-session';
import { db } from '@/db';
import { investments } from '@/db/schema';
import { eq } from 'drizzle-orm';
import type { LiveInvestmentsData, LiveAssetItem } from '@/modules/finance/domain/models/financial-types';

export async function getLiveInvestmentsData(overrideUserId?: string): Promise<LiveInvestmentsData> {
  const userId = overrideUserId ?? (await getEffectiveUserId());
  const rows = await db.select().from(investments).where(eq(investments.userId, userId));

  const total = rows.reduce((sum, item) => sum + Number(item.amount), 0);

  const assets: LiveAssetItem[] = rows.map((item) => {
    const amount = Number(item.amount);
    return {
      id: item.id,
      name: item.description,
      bank: 'manual',
      bankName: 'Manual',
      type: item.type,
      amount,
      percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
    };
  });

  return { total, assets };
}
