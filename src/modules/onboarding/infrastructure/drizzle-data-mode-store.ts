import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { users } from '@/db/schema';
import type { DataMode, DataModeStore } from '../application/choose-data-mode';

export class DrizzleDataModeStore implements DataModeStore {
  async getState(userId: string) {
    const [row] = await db
      .select({ dataMode: users.dataMode, completedAt: users.onboardingCompletedAt })
      .from(users)
      .where(eq(users.id, userId));
    return { dataMode: row?.dataMode ?? null, completed: !!row?.completedAt };
  }

  async setState(userId: string, dataMode: DataMode, completed: boolean): Promise<void> {
    await db
      .update(users)
      .set({ dataMode, onboardingCompletedAt: completed ? new Date() : null, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async complete(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ onboardingCompletedAt: new Date(), updatedAt: new Date() })
      .where(eq(users.id, userId));
  }
}
