import { describe, it, expect } from 'vitest';
import { buildAdvisorSystemPrompt, type PromptContext } from '@/modules/ai/domain/prompts/advisor-persona-prompt';

const context: PromptContext = {
  currentDate: '15 de outubro de 2026',
  currentIsoDate: '2026-10-15',
  currentMonth: '2026-10',
  facts: [],
  channel: 'telegram',
  snapshot: {
    balance: 1000,
    currentMonth: { totalIncome: 5000, totalExpenses: 2000, totalInvestments: 500, netBalance: 2500, savingsRate: 50, categories: {} },
    previousMonth: { totalIncome: 4000, totalExpenses: 1500, netBalance: 2500 },
    threeMonthsAverageExpenses: 1800,
    totalInvested: 8000,
    categoryMetrics: [],
  },
};

describe('advisor persona prompt about credit cards', () => {
  const prompt = buildAdvisorSystemPrompt(context);

  it('tells the model to ask which card before registering a card or invoice expense', () => {
    expect(prompt).toContain('fatura');
    expect(prompt).toContain('listar_cartoes');
    expect(prompt).toMatch(/pergunte qual cartão/i);
  });

  it('tells the model to offer registering a card when none exists', () => {
    expect(prompt).toContain('cadastrar_cartao');
    expect(prompt).toMatch(/nenhum cartão/i);
  });

  it('keeps the channel formatting rule last', () => {
    expect(prompt.trimEnd().endsWith('Não use títulos (#), tabelas nem linhas horizontais (---).')).toBe(true);
  });
});
