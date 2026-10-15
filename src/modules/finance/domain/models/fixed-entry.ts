export type FixedEntryKind = 'expense' | 'income';

export type FixedEntryStatus = 'launched' | 'scheduled' | 'skipped' | 'paused';

export type FixedEntry = {
  id: string;
  userId: string;
  kind: FixedEntryKind;
  description: string;
  amount: number;
  category: string;
  dueDay: number;
  active: boolean;
  startsOn: string;
  createdAt: Date;
  updatedAt: Date;
};

export type FixedEntryView = FixedEntry & {
  dueDate: string;
  status: FixedEntryStatus;
};

export type FixedLaunchLink = {
  fixedEntryId: string;
  referenceMonth: string;
};

export type NewFixedEntryInput = {
  kind: FixedEntryKind;
  description: string;
  amount: number;
  category: string;
  dueDay: number;
};

export type FixedEntryChanges = Partial<Omit<NewFixedEntryInput, 'kind'>>;
