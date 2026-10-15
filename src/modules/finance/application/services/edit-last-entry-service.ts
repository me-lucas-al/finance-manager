import type { EntryChanges, EntryRef } from '../../domain/models/entry-changes';
import { EntryNotFoundError, EntryValidationError } from '../../domain/models/entry-errors';
import { parseEditCommand } from '../../domain/parsers/parse-edit-command';
import { LatestEntryFinder } from './latest-entry-finder';

export type EntryUpdater = { execute(userId: string, ref: EntryRef, changes: EntryChanges): Promise<void> };

export class EditLastEntryService {
  constructor(
    private readonly latestEntryFinder: LatestEntryFinder,
    private readonly updateEntry: EntryUpdater,
    private readonly today: () => string
  ) {}

  async execute(userId: string, argumentsText: string): Promise<string> {
    const command = parseEditCommand(argumentsText, this.today());
    if (!command.ok) return command.message;

    const latest = await this.latestEntryFinder.find(userId);
    if (!latest) return 'Nenhum lançamento encontrado para editar.';

    try {
      await this.updateEntry.execute(userId, latest.ref, command.changes);
    } catch (error) {
      if (error instanceof EntryValidationError || error instanceof EntryNotFoundError) return error.message;
      throw error;
    }

    const description = command.changes.description ?? latest.description;
    const amount = command.changes.amount ?? latest.amount;
    return `✏️ Lançamento atualizado:\n${latest.ref.kind.toUpperCase()}: ${description} - R$ ${amount.toFixed(2)}`;
  }
}
