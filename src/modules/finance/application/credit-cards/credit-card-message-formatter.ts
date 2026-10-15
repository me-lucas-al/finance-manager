import { formatCurrency } from '@/lib/format';
import type { CreditCardUsage } from '../../domain/models/credit-card';

export const PLUGGY_CARDS_MESSAGE =
  'Seus cartões vêm do banco conectado (Pluggy). O cadastro manual de cartões só existe no modo manual.';

export const NO_CARDS_MESSAGE =
  'Você ainda não tem cartões cadastrados. Cadastre pelo menu Cartões do site ou peça por aqui, por exemplo: "cadastrar cartão Nubank limite 5000".';

function formatCardLine({ card, used, percentage }: CreditCardUsage): string {
  const name = card.lastDigits ? `${card.name} •••• ${card.lastDigits}` : card.name;
  const closing = card.closingDay ? `fecha dia ${card.closingDay}` : 'fatura do mês corrente';
  return `• ${name}: ${formatCurrency(used)} de ${formatCurrency(card.creditLimit)} (${percentage}%) · ${closing}`;
}

export function formatCreditCardsMessage(usages: CreditCardUsage[]): string {
  if (usages.length === 0) return NO_CARDS_MESSAGE;
  return ['💳 Cartões (fatura aberta)', ...usages.map(formatCardLine)].join('\n');
}
