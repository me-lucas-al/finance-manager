'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useRef, useState } from 'react';
import type { StatementFilters } from '@/modules/finance/domain/models/statement-filters';
import { applyFiltersToParams, parseStatementFilters } from '@/modules/finance/domain/services/statement-filter-params';

const SEARCH_DEBOUNCE_MS = 300;

export function useStatementFilters(filters: StatementFilters) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearchText] = useState(filters.query);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function applyFilters(next: StatementFilters) {
    const params = applyFiltersToParams(new URLSearchParams(searchParams.toString()), next);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function currentUrlFilters(): StatementFilters {
    return parseStatementFilters(Object.fromEntries(new URLSearchParams(window.location.search)));
  }

  function setSearch(value: string) {
    setSearchText(value);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => applyFilters({ ...currentUrlFilters(), query: value.trim() }), SEARCH_DEBOUNCE_MS);
  }

  function changeFilter(change: Partial<StatementFilters>) {
    clearTimeout(searchTimer.current);
    applyFilters({ ...filters, query: search.trim(), ...change });
  }

  return {
    search,
    setSearch,
    setType: (type: StatementFilters['type']) => changeFilter({ type }),
    setCategory: (category: string) => changeFilter({ category }),
  };
}
