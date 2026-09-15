import { getLiveOverviewData } from '@/lib/pluggy-service';
import { OverviewCards } from '@/components/overview/OverviewCards';
import { BalanceEvolutionCard } from '@/components/overview/BalanceEvolutionCard';

export default async function DashboardPage() {
  const data = await getLiveOverviewData();

  return (
    <div className="flex-1 min-h-screen bg-[#09090b] text-[#fafafa]">
      <div className="max-w-[1440px] mx-auto p-4 sm:p-6 md:p-8 space-y-6">
        {/* Page Heading */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white">Overview</h1>
          <p className="text-sm text-zinc-400">
            Visão geral dos seus dados financeiros.
          </p>
        </div>

        {/* Top 3 Cards Row with Live Data from Pluggy */}
        <OverviewCards
          bankData={{
            total: data.bankTotal,
            accounts: data.bankAccounts,
          }}
          creditCardData={{
            total: data.cardTotal,
            limit: data.cardLimit,
            usedPercentage: data.cardUsedPercentage,
            cards: data.cards,
          }}
          investmentsData={{
            total: data.investmentTotal,
            count: data.investmentCount,
            subtitle: `${data.activeInvestmentCount} ativos, ${data.inactiveInvestmentCount} inativos`,
            categoryName: 'Renda Fixa',
            percentage: 100,
            institutions: data.investmentInstitutions,
          }}
        />

        {/* Bottom Wide Card: Evolução do Saldo */}
        <BalanceEvolutionCard
          balance={data.evolutionBalance}
          data={data.evolutionData}
        />
      </div>
    </div>
  );
}
