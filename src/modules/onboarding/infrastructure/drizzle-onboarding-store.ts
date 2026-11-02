import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { users } from '@/db/schema';
import type { OnboardingStore } from '../application/onboarding-store';

export class DrizzleOnboardingStore implements OnboardingStore {
  async isCompleted(userId: string): Promise<boolean> {
    const [row] = await db
      .select({ completedAt: users.onboardingCompletedAt })
      .from(users)
      .where(eq(users.id, userId));
    return !!row?.completedAt;
  }

  async complete(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ onboardingCompletedAt: new Date(), updatedAt: new Date() })
      .where(eq(users.id, userId));
  }
}
