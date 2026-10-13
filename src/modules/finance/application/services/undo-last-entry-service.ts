import type { EntryRef } from '../../domain/models/entry-changes';
import { LatestEntryFinder } from './latest-entry-finder';

export type EntryRemover = { execute(userId: string, ref: EntryRef): Promise<void> };

export class UndoLastEntryService {
  constructor(
    private readonly latestEntryFinder: LatestEntryFinder,
    private readonly deleteEntry: EntryRemover
  ) {}

  async execute(userId: string): Promise<string> {
    const latest = await this.latestEntryFinder.find(userId);
    if (!latest) return 'Nenhum lançamento encontrado para desfazer.';

    await this.deleteEntry.execute(userId, latest.ref);

    return `🗑️ Lançamento desfeito com sucesso:\n${latest.ref.kind.toUpperCase()}: ${latest.description} - R$ ${latest.amount.toFixed(2)}`;
  }
}
