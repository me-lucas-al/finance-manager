import { RegisteredEntryResult } from '../use-cases/register-manual-entry';

export function formatEntryConfirmation(entry: RegisteredEntryResult): string {
  const typeIcons: Record<string, string> = {
    expense: '💸 Saída',
    income: '💰 Entrada',
    investment: '🏦 Investimento',
  };

  const lines = [
    `✅ ${typeIcons[entry.type] ?? 'Lançamento'} registrado:`,
    `• Categoria: ${entry.category}`,
    `• Descrição: ${entry.description}`,
    `• Valor: R$ ${entry.amount.toFixed(2)}`,
  ];

  if (entry.necessity) {
    const necessityLabels: Record<string, string> = {
      essencial: '🟢 Essencial',
      importante: '🟡 Importante',
      superfluo: '🔴 Supérfluo',
    };
    lines.push(`• Classificação: ${necessityLabels[entry.necessity] ?? entry.necessity}`);
  }

  if (entry.alerts.length > 0) {
    lines.push('');
    for (const alert of entry.alerts) {
      lines.push(`⚠️ ${alert.message}`);
    }
  }

  return lines.join('\n');
}
