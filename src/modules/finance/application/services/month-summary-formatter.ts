import { FinancialSnapshot } from '../../domain/models/financial-snapshot';

export function formatMonthSummary(snapshot: FinancialSnapshot, monthLabel: string): string {
  const { currentMonth, totalInvested } = snapshot;

  const topCats = Object.entries(currentMonth.categories)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([cat, val]) => `  • ${cat}: R$ ${val.toFixed(2)}`)
    .join('\n');

  const catSection = topCats ? `\n\n📌 Principais categorias:\n${topCats}` : '';

  return `📊 Resumo Financeiro (${monthLabel}):
💰 Entradas: R$ ${currentMonth.totalIncome.toFixed(2)}
💸 Saídas: R$ ${currentMonth.totalExpenses.toFixed(2)}
💵 Saldo Líquido: R$ ${currentMonth.netBalance.toFixed(2)}
📈 Taxa de Poupança: ${currentMonth.savingsRate}%
🏦 Total Investido: R$ ${totalInvested.toFixed(2)}${catSection}`;
}
