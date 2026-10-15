import type { FixedEntryStatus } from '../models/fixed-entry';

export type FixedEntryStatusInput = {
  active: boolean;
  launched: boolean;
  dueDate: string;
  startsOn: string;
};

export function calculateFixedEntryStatus({ active, launched, dueDate, startsOn }: FixedEntryStatusInput): FixedEntryStatus {
  if (launched) return 'launched';
  if (!active) return 'paused';
  if (dueDate < startsOn) return 'skipped';
  return 'scheduled';
}
