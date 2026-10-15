import { Suspense } from 'react';
import { CreditCardsSection } from '@/components/cards/CreditCardsSection';
import { SectionSkeleton } from '@/components/shared/SectionSkeleton';
import { requireUserId } from '@/modules/auth/infrastructure/require-user-id';

export default async function CardsPage() {
  const userId = await requireUserId();

  return (
    <div className="flex-1 min-h-screen bg-[#09090b] text-[#fafafa]">
      <div className="max-w-[1440px] mx-auto p-4 sm:p-6 md:p-8 space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white">Cartões de crédito</h1>
          <p className="text-sm text-zinc-400">
            Cadastre seus cartões e acompanhe quanto da fatura aberta já foi usado do limite.
          </p>
        </div>
        <Suspense fallback={<SectionSkeleton height="h-48" />}>
          <CreditCardsSection userId={userId} />
        </Suspense>
      </div>
    </div>
  );
}
