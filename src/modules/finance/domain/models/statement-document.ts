export type StatementColumn = {
  header: string;
  align: 'left' | 'right';
};

export type StatementLabeledValue = {
  label: string;
  value: string;
};

export type StatementGroup = {
  date: string;
  rows: string[][];
};

export type StatementDocument = {
  appName: string;
  userLabel: string;
  monthLabel: string;
  generatedAt: string;
  filtersLabel: string | null;
  summary: StatementLabeledValue[];
  columns: StatementColumn[];
  groups: StatementGroup[];
  totals: StatementLabeledValue[];
};
