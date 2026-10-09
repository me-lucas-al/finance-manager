export interface LiveOverviewData {
  bankTotal: number;
  bankAccounts: Array<{
    id: string;
    bank: string;
    name: string;
    countText: string;
    amount: number;
  }>;
  cardTotal: number;
  cardLimit: number;
  cardUsedPercentage: number;
  cards: Array<{
    id: string;
    name: string;
    digits: string;
    amount: number;
  }>;
  investmentTotal: number;
  investmentCount: number;
  activeInvestmentCount: number;
  inactiveInvestmentCount: number;
  evolutionBalance: number;
  evolutionData: Array<{ date: string; value: number }>;
  investmentInstitutions: Array<{ name: string; count: number; amount: number }>;
}

export interface LiveTransactionItem {
  id: string;
  dateStr: string;
  rawDate: Date;
  type: 'expense' | 'income';
  description: string;
  account: string;
  category: string;
  amount: number;
  bank: string;
  isCreditCard: boolean;
}

export interface LiveExpenseCategory {
  name: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface LiveMovementsData {
  totalExpenses: number;
  totalPending: number;
  totalIncome: number;
  netBalance: number;
  categorizedExpenses: LiveExpenseCategory[];
  pendingExpenses: LiveExpenseCategory[];
  transactions: LiveTransactionItem[];
}

export interface LiveAssetItem {
  id: string;
  name: string;
  bank: string;
  bankName: string;
  type: string;
  amount: number;
  percentage: number;
}

export interface LiveInvestmentsData {
  total: number;
  assets: LiveAssetItem[];
}
