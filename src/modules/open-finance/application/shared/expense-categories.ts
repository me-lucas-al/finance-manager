import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { userSettings } from '@/db/schema';

// Reuses the same expense categories already configurable in Settings
// (src/db/schema/index.ts:userSettings) so Gemini never invents a category the
// rest of the app (filters, goals, analytics) doesn't know about.
export async function getExpenseCategories(userId: string): Promise<string[]> {
  const [settings] = await db.select().from(userSettings).where(eq(userSettings.userId, userId));
  const categories = settings?.expenseCategories ?? [];
  return categories.length > 0 ? categories : ['Outros'];
}
