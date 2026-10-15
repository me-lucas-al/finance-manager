import { parseCurrencyAmount } from '@/modules/finance/domain/parsers/parse-currency-amount';
import type { EntryChanges } from '@/modules/finance/domain/models/entry-changes';
import type { ParsedEntry } from '@/modules/finance/domain/parsers/parse-entry-message';
import type { EditableEntry, EntryFormValues } from './entry-form-values';

export type UpdateEntryInput = { kind: EditableEntry['kind']; id: string; changes: EntryChanges };

function informedNecessity(values: EntryFormValues): Pick<EntryChanges, 'necessity'> {
  if (values.type !== 'expense' || values.necessity === '') return {};
  return { necessity: values.necessity };
}

function informedCard(values: EntryFormValues): Pick<ParsedEntry, 'creditCardId'> {
  if (values.type !== 'expense' || values.creditCardId === '') return {};
  return { creditCardId: values.creditCardId };
}

export function toCreateInput(values: EntryFormValues): ParsedEntry {
  return {
    type: values.type,
    amount: parseCurrencyAmount(values.amount) ?? 0,
    description: values.description.trim(),
    category: values.category.trim(),
    date: values.date,
    ...informedNecessity(values),
    ...informedCard(values),
  };
}

export function toUpdateInput(entry: EditableEntry, values: EntryFormValues): UpdateEntryInput {
  const amount = parseCurrencyAmount(values.amount) ?? 0;
  const description = values.description.trim();
  const category = values.category.trim();
  const cardChanged = entry.kind === 'expense' && values.creditCardId !== (entry.creditCardId ?? '');
  const changedFields: EntryChanges = {
    ...(amount !== entry.amount && { amount }),
    ...(description !== entry.description && { description }),
    ...(category !== entry.category && { category }),
    ...(values.date !== entry.date && { date: values.date }),
    ...(cardChanged && { creditCardId: values.creditCardId || null }),
  };
  const necessity = informedNecessity(values);
  const hasFieldChanges = Object.keys(changedFields).length > 0;
  const necessityChanged = necessity.necessity !== undefined && necessity.necessity !== entry.necessity;
  const changes = hasFieldChanges || necessityChanged ? { ...changedFields, ...necessity } : {};
  return { kind: entry.kind, id: entry.id, changes };
}
