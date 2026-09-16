import {
  type Account as PluggyAccount,
  type Investment as PluggyInvestment,
  type Transaction as PluggyTransaction,
  type Item as PluggyItem,
} from 'pluggy-sdk';
import { connection } from 'next/server';
import { getPluggyClient, normalizeBankName, bankDisplayName } from '@/lib/pluggy';
import { getEffectiveUserId } from '@/app/actions/require-session';
import { SupabaseAccountRepository } from '@/modules/open-finance/infrastructure/supabase-repositories';

export interface RawPluggyData {
  allItems: PluggyItem[];
  allAccounts: (PluggyAccount & { itemId: string; bank: string })[];
  allInvestments: (PluggyInvestment & { itemId: string; bank: string })[];
  allTransactions: (PluggyTransaction & {
    accountId: string;
    accountName: string;
    accountSubtype?: string;
    accountNumber?: string;
    bank: string;
    isCreditCard: boolean;
  })[];
}

// In-memory cache to avoid hitting Pluggy API on every single component render
let cache: {
  timestamp: number;
  data: RawPluggyData;
} | null = null;

const CACHE_TTL_MS = 25000; // 25 seconds

export interface LiveOverviewData {
  bankTotal: number;
  bankAccounts: Array<{
    id: string;
    bank: string;
    name: string;
    countText: string;
    amount: number;
  }>;
  cardTotal: number;
  cardLimit: number;
  cardUsedPercentage: number;
  cards: Array<{
    id: string;
    name: string;
    digits: string;
    amount: number;
  }>;
  investmentTotal: number;
  investmentCount: number;
  activeInvestmentCount: number;
  inactiveInvestmentCount: number;
  evolutionBalance: number;
  evolutionData: Array<{ date: string; value: number }>;
  investmentInstitutions: Array<{ name: string; count: number; amount: number }>;
}

export interface LiveTransactionItem {
  id: string;
  dateStr: string;
  rawDate: Date;
  type: 'expense' | 'income';
  description: string;
  account: string;
  category: string;
  amount: number;
  bank: string;
  isCreditCard: boolean;
}

export interface LiveExpenseCategory {
  name: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface LiveMovementsData {
  totalExpenses: number;
  totalPending: number;
  totalIncome: number;
  netBalance: number;
  categorizedExpenses: LiveExpenseCategory[];
  pendingExpenses: LiveExpenseCategory[];
  transactions: LiveTransactionItem[];
}

export interface LiveAssetItem {
  id: string;
  name: string;
  bank: string;
  bankName: string;
  type: string;
  amount: number;
  percentage: number;
}

export async function fetchRawPluggyData(): Promise<RawPluggyData> {
  await connection();
  if (cache && Date.now() - cache.timestamp < CACHE_TTL_MS) {
    return cache.data;
  }

  let itemIds: string[] = [];
  try {
    const userId = await getEffectiveUserId();
    const repo = new SupabaseAccountRepository();
    const dbAccounts = await repo.findAllByUserId(userId);
    itemIds = Array.from(new Set(dbAccounts.map((a) => a.pluggyItemId).filter(Boolean)));
  } catch {
    itemIds = [];
  }

  if (itemIds.length === 0) {
    const empty: RawPluggyData = { allItems: [], allAccounts: [], allInvestments: [], allTransactions: [] };
    cache = { timestamp: Date.now(), data: empty };
    return empty;
  }

  const client = getPluggyClient();
  const allAccounts: RawPluggyData['allAccounts'] = [];
  const allInvestments: RawPluggyData['allInvestments'] = [];
  const allTransactions: RawPluggyData['allTransactions'] = [];
  const allItems: PluggyItem[] = [];

  for (const itemId of itemIds) {
    try {
      const [item, accs, invs] = await Promise.all([
        client.fetchItem(itemId).catch(() => null),
        client.fetchAccounts(itemId).catch(() => ({ results: [] as PluggyAccount[] })),
        client.fetchInvestments(itemId).catch(() => ({ results: [] as PluggyInvestment[] })),
      ]);

      if (item) allItems.push(item);

      for (const a of accs.results) {
        const bank = normalizeBankName(a.name);
        allAccounts.push({ ...a, itemId, bank });
        try {
          const txRes = await client.fetchTransactionsCursor(a.id);
          for (const tx of txRes.results) {
            allTransactions.push({
              ...tx,
              accountId: a.id,
              accountName: a.name,
              accountSubtype: a.subtype,
              accountNumber: a.number,
              bank,
              isCreditCard: a.subtype === 'CREDIT_CARD',
            });
          }
        } catch {
          // ignore transaction fetch error for single account
        }
      }

      for (const inv of invs.results) {
        allInvestments.push({ ...inv, itemId, bank: normalizeBankName(inv.name) });
      }
    } catch {
      // ignore
    }
  }

  const result: RawPluggyData = { allItems, allAccounts, allInvestments, allTransactions };
  cache = { timestamp: Date.now(), data: result };
  return result;
}

export async function getLiveOverviewData(): Promise<LiveOverviewData> {
  const { allAccounts, allInvestments, allTransactions } = await fetchRawPluggyData();

  // 1. Bank Accounts (Checking)
  const checkingAccounts = allAccounts.filter(
    (a: PluggyAccount) => a.subtype === 'CHECKING_ACCOUNT' || a.type === 'BANK'
  );

  const bankTotal = checkingAccounts.reduce((sum, a) => sum + (Number(a.balance) || 0), 0);

  const bankAccounts: LiveOverviewData['bankAccounts'] = checkingAccounts.map((a) => {
    const amount = Number(a.balance) || 0;
    return {
      id: a.id,
      bank: a.bank,
      name: bankDisplayName(a.bank),
      countText: `1 conta · ${bankTotal > 0 ? ((amount / bankTotal) * 100).toFixed(1) : 0}%`,
      amount,
    };
  });

  // 2. Credit Cards
  const cards = allAccounts.filter(
    (a: PluggyAccount) => a.subtype === 'CREDIT_CARD' || a.type === 'CREDIT'
  );
  const cardList = cards.map((c: PluggyAccount) => ({
    id: c.id,
    name: c.name,
    digits: c.number ? `xxxx ${c.number.slice(-4)}` : 'xxxx 0000',
    amount: Number(c.balance) || 0,
  }));

  cardList.sort((a, b) => a.amount - b.amount);

  const cardTotal = cardList.reduce((sum: number, c) => sum + c.amount, 0);
  const cardLimit = cards.reduce(
    (sum: number, c: PluggyAccount) => sum + (Number(c.creditData?.creditLimit) || 0),
    0
  );
  const cardUsedPercentage = cardLimit > 0 ? Math.round((cardTotal / cardLimit) * 100) : 0;

  // 3. Investments
  const investmentTotal = allInvestments.reduce(
    (sum: number, i: PluggyInvestment) => sum + (Number(i.balance) || 0),
    0
  );
  const investmentCount = allInvestments.length;
  const activeInvestmentCount = allInvestments.filter(
    (i: PluggyInvestment) => Number(i.balance) > 0
  ).length;
  const inactiveInvestmentCount = investmentCount - activeInvestmentCount;

  // Investment Institutions dynamic breakdown, grouped by resolved bank
  const instMap = new Map<string, { count: number; amount: number }>();
  for (const inv of allInvestments) {
    const bal = Number(inv.balance) || 0;
    const name = bankDisplayName(inv.bank);
    const entry = instMap.get(name) ?? { count: 0, amount: 0 };
    entry.count += 1;
    entry.amount += bal;
    instMap.set(name, entry);
  }

  const investmentInstitutions = Array.from(instMap.entries()).map(([name, data]) => ({
    name,
    count: data.count,
    amount: Math.round(data.amount * 100) / 100,
  }));

  // 4. Balance Evolution dynamic computation from allTransactions
  const monthlyBalances = new Map<string, number>();
  for (const tx of allTransactions) {
    const txDateStr = tx.date instanceof Date ? tx.date.toISOString() : String(tx.date);
    const ym = txDateStr.slice(0, 7);
    const amt = tx.type === 'CREDIT' ? Math.abs(Number(tx.amount)) : -Math.abs(Number(tx.amount));
    monthlyBalances.set(ym, (monthlyBalances.get(ym) || 0) + amt);
  }

  const sortedMonths = Array.from(monthlyBalances.keys()).sort();
  const timelineMonths = sortedMonths.slice(-9);

  let currentVal = bankTotal;
  const evolutionReversed: Array<{ date: string; value: number }> = [];
  const revMonths = [...timelineMonths].reverse();
  for (const m of revMonths) {
    evolutionReversed.push({ date: m, value: Math.max(0, Math.round(currentVal * 100) / 100) });
    const net = monthlyBalances.get(m) || 0;
    currentVal = Math.max(0, currentVal - net);
  }
  const evolutionData = evolutionReversed.reverse();

  return {
    bankTotal,
    bankAccounts,
    cardTotal,
    cardLimit,
    cardUsedPercentage,
    cards: cardList,
    investmentTotal,
    investmentCount,
    activeInvestmentCount,
    inactiveInvestmentCount,
    evolutionBalance: bankTotal,
    evolutionData,
    investmentInstitutions,
  };
}

const WEEKDAYS = [
  'Domingo',
  'Segunda-Feira',
  'Terça-Feira',
  'Quarta-Feira',
  'Quinta-Feira',
  'Sexta-Feira',
  'Sábado',
];

export async function getLiveMovementsData(selectedMonth: string): Promise<LiveMovementsData> {
  const { allTransactions } = await fetchRawPluggyData();

  // Normalize transactions
  const mapped: LiveTransactionItem[] = allTransactions.map((tx) => {
    const rawDate = new Date(tx.date);
    const day = rawDate.getDate();
    const weekday = WEEKDAYS[rawDate.getDay()];
    const dateStr = `${day} ${weekday}`;

    const numAmount = Number(tx.amount);
    const isIncome = tx.type === 'CREDIT' || numAmount > 0;
    const isExpense = !isIncome;

    return {
      id: tx.id,
      dateStr,
      rawDate,
      type: isExpense ? 'expense' : 'income',
      description: tx.description,
      account: tx.accountName || 'Conta Corrente',
      category: tx.category || 'Outros',
      amount: numAmount,
      bank: tx.bank,
      isCreditCard: tx.isCreditCard,
    };
  });

  // Filter for selected month
  const [targetYear, targetMonth] = selectedMonth.split('-').map(Number);
  const monthTransactions = mapped.filter((t) => {
    const y = t.rawDate.getFullYear();
    const m = t.rawDate.getMonth() + 1;
    return y === targetYear && m === targetMonth;
  });

  // Sort by date descending
  monthTransactions.sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());

  // Categorize expenses
  const categoryTotals: Record<string, number> = {};
  let totalExpenses = 0;
  let totalIncome = 0;

  for (const tx of monthTransactions) {
    if (tx.type === 'expense') {
      const val = Math.abs(tx.amount);
      totalExpenses += val;
      categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + val;
    } else {
      totalIncome += Math.abs(tx.amount);
    }
  }

  // Color map for categories (Transfers is dark blue per user requirement)
  const colorMap: Record<string, string> = {
    Transfers: 'bg-blue-600',
    'Eating out': 'bg-indigo-500',
    Groceries: 'bg-sky-500',
    School: 'bg-purple-500',
    Shopping: 'bg-cyan-500',
    'Gas stations': 'bg-amber-400',
    Clothing: 'bg-emerald-500',
    'Taxi and ride-hailing': 'bg-teal-500',
  };

  const maxCat = Math.max(...Object.values(categoryTotals), 1);
  const categorizedExpenses: LiveExpenseCategory[] = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([name, amt]) => ({
      name,
      amount: amt,
      percentage: Math.round((amt / maxCat) * 100),
      color: colorMap[name] || 'bg-blue-600',
    }));

  // Dynamic Pending Expenses from Credit Card Transactions
  const creditCardTxs = allTransactions.filter(
    (t) => t.isCreditCard && (t.type === 'DEBIT' || Number(t.amount) < 0)
  );

  const pendingTotals: Record<string, number> = {};
  let totalPending = 0;
  for (const tx of creditCardTxs.slice(0, 50)) {
    const val = Math.abs(Number(tx.amount));
    totalPending += val;
    const cat = tx.category || 'Outros';
    pendingTotals[cat] = (pendingTotals[cat] || 0) + val;
  }

  const maxPending = Math.max(...Object.values(pendingTotals), 1);
  const pendingExpenses: LiveExpenseCategory[] = Object.entries(pendingTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, amt]) => ({
      name,
      amount: Math.round(amt * 100) / 100,
      percentage: Math.round((amt / maxPending) * 100),
      color: colorMap[name] || 'bg-blue-600',
    }));

  return {
    totalExpenses: Math.round(totalExpenses * 100) / 100,
    totalPending: Math.round(totalPending * 100) / 100,
    totalIncome: Math.round(totalIncome * 100) / 100,
    netBalance: totalIncome - totalExpenses,
    categorizedExpenses,
    pendingExpenses,
    transactions: monthTransactions,
  };
}

export async function getLiveInvestmentsData(): Promise<{
  total: number;
  assets: LiveAssetItem[];
}> {
  const { allInvestments } = await fetchRawPluggyData();

  const total = allInvestments.reduce(
    (sum: number, i: PluggyInvestment) => sum + (Number(i.balance) || 0),
    0
  );

  const assets: LiveAssetItem[] = allInvestments.map((inv) => {
    const bal = Number(inv.balance) || 0;
    const pct = total > 0 ? Math.round((bal / total) * 100) : 0;

    return {
      id: inv.id,
      name: inv.name,
      bank: inv.bank,
      bankName: bankDisplayName(inv.bank),
      type: inv.type === 'FIXED_INCOME' ? 'Renda Fixa' : inv.subtype || 'Investimento',
      amount: bal,
      percentage: pct,
    };
  });

  assets.sort((a, b) => b.amount - a.amount);

  return {
    total,
    assets,
  };
}
