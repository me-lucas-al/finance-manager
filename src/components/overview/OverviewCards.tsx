import type { BankOverview, CreditCardOverviews, InvestmentOverview } from '@/types/overview';
import { BankAccountsCard } from './BankAccountsCard';
import { CreditCardsCard } from './CreditCardsCard';
import { InvestmentsCard } from './InvestmentsCard';

interface OverviewCardsProps {
  bankData: BankOverview;
  creditCardData: CreditCardOverviews;
  investmentsData: InvestmentOverview;
}

export function OverviewCards({ bankData, creditCardData, investmentsData }: OverviewCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <BankAccountsCard bank={bankData} />
      <CreditCardsCard credit={creditCardData} />
      <InvestmentsCard investments={investmentsData} />
    </div>
  );
}
