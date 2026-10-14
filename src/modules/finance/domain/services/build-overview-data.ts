import type { LedgerEntry } from '../models/ledger-entry';
import type { LiveOverviewData } from '../models/financial-types';
import { EMPTY_PORTFOLIO, type Portfolio } from '../models/portfolio';
import { buildBankAccounts } from './build-bank-accounts';
import { buildCardSummary } from './build-card-summary';
import { computeBankBalance } from './compute-bank-balance';
import { computeInvestmentTotal } from './compute-investment-total';
import { groupInvestments } from './group-investments';
import { investmentEntriesOf } from './investment-entries';
import { balanceThrough, monthlyEvolution } from './summarize-ledger';

const EVOLUTION_MONTHS = 6;

export function buildOverviewData(
  entries: LedgerEntry[],
  currentMonth: string,
  portfolio: Portfolio = EMPTY_PORTFOLIO,
): LiveOverviewData {
  const bankTotal = computeBankBalance(entries, portfolio);
  const manualInvestments = investmentEntriesOf(entries, portfolio);
  const activeCount =
    manualInvestments.filter((investment) => investment.amount > 0).length +
    portfolio.holdings.filter((holding) => holding.balance > 0).length;
  const totalCount = manualInvestments.length + portfolio.holdings.length;
  const balanceOffset = bankTotal - balanceThrough(entries, currentMonth);
  const evolution = monthlyEvolution(entries, currentMonth, EVOLUTION_MONTHS);

  return {
    bankTotal,
    bankAccounts: buildBankAccounts(portfolio, bankTotal),
    ...buildCardSummary(portfolio),
    investmentTotal: computeInvestmentTotal(entries, portfolio),
    investmentCount: totalCount,
    activeInvestmentCount: activeCount,
    inactiveInvestmentCount: totalCount - activeCount,
    evolutionBalance: bankTotal,
    evolutionData: evolution.map((point) => ({ date: point.month, value: point.cumulativeBalance + balanceOffset })),
    investmentInstitutions: groupInvestments(manualInvestments, portfolio),
  };
}
