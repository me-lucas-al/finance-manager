import { AtivosList } from '@/components/ativos/AtivosList';

export default async function AtivosPage() {
  return (
    <div className="flex-1 min-h-screen bg-[#09090b] text-[#fafafa]">
      <div className="max-w-[1440px] mx-auto p-4 sm:p-6 md:p-8 space-y-6">
        {/* Page Title */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white">Ativos</h1>
          <p className="text-sm text-zinc-400">
            Seus investimentos e movimentações.
          </p>
        </div>

        {/* Ativos List and Summary */}
        <AtivosList />
      </div>
    </div>
  );
}
