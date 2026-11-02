import { Card, CardContent } from '@/components/ui/card';
import { loadCreditCardUsage } from '@/composition/credit-card-views';
import { CreditCardsPanel } from './CreditCardsPanel';

export async function CreditCardsSection({ userId }: { userId: string }) {
  const usages = await loadCreditCardUsage(userId);

  return (
    <Card className="bg-[#111216] border-zinc-800/80 rounded-2xl shadow-sm">
      <CardContent className="px-6 py-5">
        <CreditCardsPanel usages={usages} />
      </CardContent>
    </Card>
  );
}
