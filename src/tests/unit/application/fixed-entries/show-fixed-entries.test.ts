import { describe, it, expect } from 'vitest';
import { ShowFixedEntriesUseCase } from '@/modules/finance/application/fixed-entries/show-fixed-entries';
import { HandleBotCommandUseCase } from '@/modules/finance/application/use-cases/handle-bot-command';
import { buildFixedEntryViews } from '@/modules/finance/domain/services/build-fixed-entry-views';
import { LedgerService } from '@/modules/finance/application/services/ledger-service';
import { PortfolioService } from '@/modules/finance/application/services/portfolio-service';
import { fakePortfolioSource } from '@/tests/fakes/fake-portfolio-source';
import { sampleLedgerSource } from '@/tests/fakes/fake-ledger-source';
import { makeFixedEntry } from '@/tests/fakes/fixed-entry-fixture';

const views = buildFixedEntryViews(
  [
    makeFixedEntry({ id: 'rent', description: 'Aluguel', amount: 1000, dueDay: 5 }),
    makeFixedEntry({ id: 'salary', kind: 'income', description: 'Salário', amount: 5000, dueDay: 25 }),
  ],
  new Set(['rent']),
  '2026-03'
);

const ledger = new LedgerService(sampleLedgerSource);
const portfolio = new PortfolioService(fakePortfolioSource());

describe('ShowFixedEntriesUseCase', () => {
  it('lists each fixed entry with its status and the projected balance', async () => {
    const message = await new ShowFixedEntriesUseCase({ execute: async () => views }, ledger, portfolio).execute('user-1');

    expect(message).toContain('Fixos do mês');
    expect(message).toContain('dia 05 · Aluguel');
    expect(message).toContain('lançado');
    expect(message).toContain('dia 25 · Salário');
    expect(message).toContain('agendado');
    expect(message).toContain('Lançados 1 de 2');
    expect(message).toContain('Saldo projetado');
  });

  it('explains how to create the first one when there are none', async () => {
    const message = await new ShowFixedEntriesUseCase({ execute: async () => [] }, ledger, portfolio).execute('user-1');

    expect(message).toContain('ainda não tem lançamentos fixos');
  });
});

describe('/fixos bot command', () => {
  const bot = new HandleBotCommandUseCase(
    {} as never,
    { execute: async () => '' },
    ledger,
    portfolio,
    {} as never,
    { execute: async () => 'lista de fixos' }
  );

  it('answers with the fixed entries report', async () => {
    expect(await bot.execute('user-1', '/fixos')).toBe('lista de fixos');
  });

  it('is advertised in the help message', async () => {
    expect(await bot.execute('user-1', '/ajuda')).toContain('/fixos');
  });
});
