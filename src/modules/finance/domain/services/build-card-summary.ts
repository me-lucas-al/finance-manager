import type { LiveOverviewData } from '../models/financial-types';
import type { Portfolio } from '../models/portfolio';
import { cardAccountsOf } from './account-kinds';

type CardSummary = Pick<LiveOverviewData, 'cardTotal' | 'cardLimit' | 'cardUsedPercentage' | 'cards'>;

export function buildCardSummary(portfolio: Portfolio): CardSummary {
  const cards = cardAccountsOf(portfolio.accounts);
  const cardTotal = cards.reduce((sum, card) => sum + Math.abs(card.balance), 0);
  const cardLimit = cards.reduce((sum, card) => sum + (card.creditLimit ?? 0), 0);
  return {
    cardTotal,
    cardLimit,
    cardUsedPercentage: cardLimit > 0 ? Math.round((cardTotal / cardLimit) * 100) : 0,
    cards: cards.map((card) => ({ id: card.id, name: card.bank, digits: '', amount: Math.abs(card.balance) })),
  };
}
