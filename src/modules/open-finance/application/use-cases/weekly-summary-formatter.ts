import { formatCurrency } from '@/lib/format';
import type { SavingsGoal } from '../../domain/repositories/savings-goal-repository';

export type SummaryData = {
  totalSpent: number;
  spendByCategory: Map<string, number>;
  superfluousTotal: number;
  generalTarget: number | null;
  categoryTargets: { category: string; targetAmount: number }[];
  savingsGoals: SavingsGoal[];
};

export function buildDeterministicSummary(data: SummaryData): string {
  const lines = ['📊 Resumo Semanal Financeiro', '', `Total gasto no mês: ${formatCurrency(data.totalSpent)}`];

  if (data.superfluousTotal > 0) {
    lines.push(`⚠️ Gastos supérfluos: ${formatCurrency(data.superfluousTotal)}`);
  }

  if (data.generalTarget !== null) {
    lines.push(`Meta geral: ${formatCurrency(data.generalTarget)}`);
  }

  for (const t of data.categoryTargets) {
    const s = data.spendByCategory.get(t.category) ?? 0;
    lines.push(`• ${t.category}: ${formatCurrency(s)} de ${formatCurrency(t.targetAmount)}`);
  }

  if (data.savingsGoals.length > 0) {
    lines.push('', 'Metas de economia:');
    for (const g of data.savingsGoals) {
      lines.push(`• ${g.title}: ${formatCurrency(g.currentAmount)} de ${formatCurrency(g.targetAmount)}`);
    }
  }

  return lines.join('\n');
}
