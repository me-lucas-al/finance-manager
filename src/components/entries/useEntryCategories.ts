'use client';

import { useEffect, useState } from 'react';
import { listExpenseCategoriesAction } from '@/app/actions/entry-categories';
import { buildCategoriesByType, type CategoriesByType } from './entry-category-options';

export function useEntryCategories(): CategoriesByType {
  const [expenseCategories, setExpenseCategories] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    listExpenseCategoriesAction()
      .then((categories) => active && setExpenseCategories(categories))
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  return buildCategoriesByType(expenseCategories);
}
