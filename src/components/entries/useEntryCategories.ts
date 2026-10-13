'use client';

import { useEffect, useState } from 'react';
import { listExpenseCategoriesAction } from '@/app/actions/entry-categories';
import { buildCategoriesByType, type CategoriesByType } from './entry-category-options';

export function useEntryCategories(isOpen: boolean): CategoriesByType {
  const [expenseCategories, setExpenseCategories] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!isOpen || isLoaded) return;
    let active = true;
    listExpenseCategoriesAction()
      .then((categories) => {
        if (!active) return;
        setExpenseCategories(categories);
        setIsLoaded(true);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [isOpen, isLoaded]);

  return buildCategoriesByType(expenseCategories);
}
