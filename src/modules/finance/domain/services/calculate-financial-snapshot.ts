import { FinancialSnapshot, CategoryMetric } from '../models/financial-snapshot';
import { Transaction } from '@/modules/open-finance/domain/repositories/transaction-repository';
import { Income } from '../repositories/income-repository';
import { Investment } from '../repositories/investment-repository';
import { Goal } from '@/modules/open-finance/domain/repositories/goal-repository';
import { getCurrentMonth, shiftMonth } from '@/lib/month';

export type SnapshotInput = {
  transactions: Transaction[];
  incomes: Income[];
  investments: Investment[];
  goals: Goal[];
  referenceMonth?: string;
};

export function calculateFinancialSnapshot(input: SnapshotInput): FinancialSnapshot {
  const curMonth = input.referenceMonth ?? getCurrentMonth();
  const prevMonth = shiftMonth(curMonth, -1);
  const m2 = shiftMonth(curMonth, -2);

  const manualTxs = input.transactions.filter((t) => t.source === 'manual');
  const curTxs = manualTxs.filter((t) => t.occurredAt.slice(0, 7) === curMonth);
  const prevTxs = manualTxs.filter((t) => t.occurredAt.slice(0, 7) === prevMonth);
  const m2Txs = manualTxs.filter((t) => t.occurredAt.slice(0, 7) === m2);

  const curIncs = input.incomes.filter((i) => i.receivedAt.toISOString().slice(0, 7) === curMonth);
  const prevIncs = input.incomes.filter((i) => i.receivedAt.toISOString().slice(0, 7) === prevMonth);

  const curExpense = curTxs.reduce((s, t) => s + Number(t.amount), 0);
  const prevExpense = prevTxs.reduce((s, t) => s + Number(t.amount), 0);
  const m2Expense = m2Txs.reduce((s, t) => s + Number(t.amount), 0);

  const curIncome = curIncs.reduce((s, i) => s + Number(i.amount), 0);
  const prevIncome = prevIncs.reduce((s, i) => s + Number(i.amount), 0);

  const curInvest = input.investments
    .filter((inv) => inv.date.toISOString().slice(0, 7) === curMonth)
    .reduce((s, inv) => s + Number(inv.amount), 0);

  const totalInvested = input.investments.reduce((s, inv) => s + Number(inv.amount), 0);
  const savingsRate = curIncome > 0 ? Math.round(((curIncome - curExpense) / curIncome) * 100) : 0;

  const curCats: Record<string, number> = {};
  for (const t of curTxs) {
    const c = t.category || 'Outros';
    curCats[c] = (curCats[c] ?? 0) + Number(t.amount);
  }

  const prevCats: Record<string, number> = {};
  for (const t of prevTxs) {
    const c = t.category || 'Outros';
    prevCats[c] = (prevCats[c] ?? 0) + Number(t.amount);
  }

  const allCatKeys = Array.from(new Set([...Object.keys(curCats), ...Object.keys(prevCats)]));
  const categoryMetrics: CategoryMetric[] = allCatKeys.map((c) => {
    const cAmt = curCats[c] ?? 0;
    const pAmt = prevCats[c] ?? 0;
    const diff = pAmt > 0 ? Math.round(((cAmt - pAmt) / pAmt) * 100) : 0;
    const g = input.goals.find((goal) => goal.category?.toLowerCase() === c.toLowerCase());
    return {
      category: c,
      currentAmount: cAmt,
      previousAmount: pAmt,
      diffPercentage: diff,
      goalAmount: g ? Number(g.targetAmount) : undefined,
    };
  });

  return {
    currentMonth: {
      totalIncome: curIncome,
      totalExpenses: curExpense,
      totalInvestments: curInvest,
      netBalance: curIncome - curExpense,
      savingsRate,
      categories: curCats,
    },
    previousMonth: {
      totalIncome: prevIncome,
      totalExpenses: prevExpense,
      netBalance: prevIncome - prevExpense,
    },
    threeMonthsAverageExpenses: Math.round(((curExpense + prevExpense + m2Expense) / 3) * 100) / 100,
    totalInvested,
    categoryMetrics,
  };
}
