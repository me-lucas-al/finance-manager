import { describe, it, expect, vi } from 'vitest';
import { HandleBotCommandUseCase } from '@/modules/finance/application/use-cases/handle-bot-command';
import type { UndoLastEntryService } from '@/modules/finance/application/services/undo-last-entry-service';
import type { PortfolioService } from '@/modules/finance/application/services/portfolio-service';
import type { LedgerService } from '@/modules/finance/application/services/ledger-service';
import type { GoalRepository } from '@/modules/open-finance/domain/repositories/goal-repository';
import type { LedgerEntry } from '@/modules/finance/domain/models/ledger-entry';
import { EMPTY_PORTFOLIO } from '@/modules/finance/domain/models/portfolio';
import { getCurrentMonth } from '@/lib/month';

function buildUseCase() {
  const curMonth = getCurrentMonth();
  const mockEntries: LedgerEntry[] = [
    {
      id: 'e1',
      kind: 'income',
      amount: 5000,
      category: 'Salário',
      description: 'Salário Empresa',
      account: 'Conta Corrente',
      date: `${curMonth}-05`,
      fixed: false,
    },
  ];

  const ledger = {
    load: vi.fn(async () => mockEntries),
  };
  const portfolio = {
    load: vi.fn(async () => EMPTY_PORTFOLIO),
  };
  const goalRepo = {
    findAllByUserIdAndMonth: vi.fn(async () => []),
  };

  const useCase = new HandleBotCommandUseCase(
    {} as UndoLastEntryService,
    { execute: vi.fn() },
    ledger as unknown as LedgerService,
    portfolio as unknown as PortfolioService,
    goalRepo as unknown as GoalRepository,
    { execute: vi.fn() },
    { execute: vi.fn() }
  );

  return { useCase, ledger, portfolio, goalRepo };
}

describe('HandleBotCommandUseCase /relatorio', () => {
  it('generates report snapshot when /relatorio is sent', async () => {
    const { useCase, ledger } = buildUseCase();

    const reply = await useCase.execute('user-1', '/relatorio');

    expect(ledger.load).toHaveBeenCalledWith('user-1');
    expect(reply).toContain('Resumo');
  });

  it('generates report snapshot when /relatório with accent is sent', async () => {
    const { useCase, ledger } = buildUseCase();

    const reply = await useCase.execute('user-1', '/relatório');

    expect(ledger.load).toHaveBeenCalledWith('user-1');
    expect(reply).toContain('Resumo');
  });
});
