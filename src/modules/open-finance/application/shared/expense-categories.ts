import type { SettingRepository } from '@/modules/users/domain/repositories/setting-repository';

export type ListExpenseCategories = (userId: string) => Promise<string[]>;

const FALLBACK_CATEGORIES = ['Outros'];

export function createExpenseCategoriesLister(settings: SettingRepository): ListExpenseCategories {
  return async (userId) => {
    const setting = await settings.findByUserId(userId);
    const categories = setting?.expenseCategories ?? [];
    return categories.length > 0 ? categories : FALLBACK_CATEGORIES;
  };
}
