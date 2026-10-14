import { Amount } from '@/components/shared/Amount';
import type { InvestmentInstitution } from '@/types/overview';

export function InvestmentInstitutionsView({ institutions }: { institutions: InvestmentInstitution[] }) {
  if (institutions.length === 0) {
    return <p className="text-xs text-zinc-500">Nenhum investimento encontrado.</p>;
  }

  return (
    <div className="space-y-2.5">
      {institutions.map((institution) => (
        <div key={institution.name} className="flex items-center justify-between text-xs text-zinc-300">
          <span>
            {institution.name} ({institution.count} {institution.count === 1 ? 'ativo' : 'ativos'})
          </span>
          <Amount value={institution.amount} />
        </div>
      ))}
    </div>
  );
}
