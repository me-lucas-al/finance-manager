import { describe, it, expect, vi } from 'vitest';
import { HandleBotCommandUseCase } from '@/modules/finance/application/use-cases/handle-bot-command';
import type { UndoLastEntryService } from '@/modules/finance/application/services/undo-last-entry-service';
import type { PortfolioService } from '@/modules/finance/application/services/portfolio-service';
import type { LedgerService } from '@/modules/finance/application/services/ledger-service';
import type { GoalRepository } from '@/modules/open-finance/domain/repositories/goal-repository';

function buildUseCase(editLastEntry = { execute: vi.fn(async () => 'editado') }) {
  const useCase = new HandleBotCommandUseCase(
    {} as UndoLastEntryService,
    editLastEntry,
    {} as LedgerService,
    {} as PortfolioService,
    {} as GoalRepository,
    { execute: vi.fn() },
    { execute: vi.fn() }
  );
  return { useCase, editLastEntry };
}

describe('HandleBotCommandUseCase /editar', () => {
  it('delegates the text after the command to the last entry editor', async () => {
    const { useCase, editLastEntry } = buildUseCase();

    const reply = await useCase.execute('user-1', '/editar descricao Almoço Com Amigos');

    expect(reply).toBe('editado');
    expect(editLastEntry.execute).toHaveBeenCalledWith('user-1', ' descricao Almoço Com Amigos');
  });

  it('delegates an empty argument when only the command is sent', async () => {
    const { useCase, editLastEntry } = buildUseCase();

    await useCase.execute('user-1', '/EDITAR');

    expect(editLastEntry.execute).toHaveBeenCalledWith('user-1', '');
  });

  it('documents the edit command in the help message', async () => {
    const { useCase } = buildUseCase();

    const help = await useCase.execute('user-1', '/ajuda');

    expect(help).toContain('/editar');
    expect(help).toContain('/editar valor');
  });
});
