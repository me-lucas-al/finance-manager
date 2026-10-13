'use client';

import { useMemo, useState } from 'react';
import type { LiveTransactionItem } from '@/modules/finance/domain/models/financial-types';
import { signedAmount } from './entry-kind-style';

export type TypeFilter = 'all' | LiveTransactionItem['type'];

export function useTransactionFilters(transactions: LiveTransactionItem[]) {
  const [search, setSearch] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return transactions.filter((tx) => {
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
      if (selectedAccount !== 'all' && tx.bank !== selectedAccount) return false;
      if (!query) return true;
      return [tx.description, tx.category, tx.account].some((field) => field.toLowerCase().includes(query));
    });
  }, [transactions, search, selectedAccount, typeFilter]);

  const balance = useMemo(
    () => filtered.reduce((sum, tx) => sum + signedAmount(tx.type, tx.amount), 0),
    [filtered]
  );

  const grouped = useMemo(() => {
    const byDate = new Map<string, LiveTransactionItem[]>();
    for (const tx of filtered) byDate.set(tx.dateStr, [...(byDate.get(tx.dateStr) ?? []), tx]);
    return Array.from(byDate.entries());
  }, [filtered]);

  return { search, setSearch, selectedAccount, setSelectedAccount, typeFilter, setTypeFilter, filtered, balance, grouped };
}
