import { EntryValidationError } from '../../domain/models/entry-errors';
import type { CardLinkValidator } from '../../domain/ports/card-link-validator';
import type { EntryType } from '../../domain/parsers/parse-entry-message';

export async function assertCardLink(
  validator: CardLinkValidator,
  userId: string,
  kind: EntryType,
  creditCardId: string | null | undefined
): Promise<void> {
  if (creditCardId === undefined || creditCardId === null) return;
  if (kind !== 'expense') throw new EntryValidationError('Só despesas podem ser vinculadas a um cartão');
  await validator.assertUsable(userId, creditCardId);
}
