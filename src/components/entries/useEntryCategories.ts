'use client';

import { useState } from 'react';
import { listExpenseCategoriesAction } from '@/app/actions/entry-categories';
import { buildCategoriesByType, type CategoriesByType } from './entry-category-options';

export function useEntryCategories(): { categoriesByType: CategoriesByType; loadCategories: () => void } {
  const [expenseCategories, setExpenseCategories] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  function loadCategories() {
    if (isLoaded) return;
    listExpenseCategoriesAction()
      .then((categories) => {
        setExpenseCategories(categories);
        setIsLoaded(categories.length > 0);
      })
      .catch(() => undefined);
  }

  return { categoriesByType: buildCategoriesByType(expenseCategories), loadCategories };
}
