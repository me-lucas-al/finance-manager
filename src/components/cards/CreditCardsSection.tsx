import { Card, CardContent } from '@/components/ui/card';
import { loadCreditCardUsage, readDataMode } from '@/composition/credit-card-views';
import { CreditCardsPanel } from './CreditCardsPanel';

export async function CreditCardsSection({ userId }: { userId: string }) {
  const mode = await readDataMode(userId);
  const usages = mode === 'manual' ? await loadCreditCardUsage(userId) : null;

  return (
    <Card className="bg-[#111216] border-zinc-800/80 rounded-2xl shadow-sm">
      <CardContent className="px-6 py-5">
        {usages ? (
          <CreditCardsPanel usages={usages} />
        ) : (
          <p className="text-sm text-zinc-400">
            Seus cartões vêm do banco conectado (Pluggy). O cadastro manual só existe no modo manual.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
