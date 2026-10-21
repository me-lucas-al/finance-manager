import type { ImportedEntry } from './import-announcer';
import type { PluggyLedgerEntry } from './map-pluggy-transaction';

export function toImportedEntry(entry: PluggyLedgerEntry, origin: { bank: string }): ImportedEntry {
  return { kind: entry.kind, description: entry.description, amount: entry.amount, bank: origin.bank };
}
