import { EntryNotFoundError } from '../../domain/models/entry-errors';
import type { FixedEntry } from '../../domain/models/fixed-entry';
import type { FixedEntryRepository } from '../../domain/repositories/fixed-entry-repository';

export async function findOwnedFixedEntry(
  rules: FixedEntryRepository,
  userId: string,
  fixedEntryId: string
): Promise<FixedEntry> {
  const rule = await rules.findById(fixedEntryId);
  if (!rule || rule.userId !== userId) throw new EntryNotFoundError('Lançamento fixo não encontrado');
  return rule;
}
