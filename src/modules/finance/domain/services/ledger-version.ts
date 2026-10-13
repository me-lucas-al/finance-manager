import type { LedgerEntry } from '../models/ledger-entry';

export function computeLedgerVersion(entries: LedgerEntry[]): string {
  const fingerprint = [...entries]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((entry) => [entry.id, entry.kind, entry.date, entry.amount, entry.category, entry.description].join('|'))
    .join('\n');
  let hash = 5381;
  for (let index = 0; index < fingerprint.length; index++) {
    hash = ((hash << 5) + hash + fingerprint.charCodeAt(index)) | 0;
  }
  return `${entries.length}-${(hash >>> 0).toString(36)}`;
}
