import type { LiveAssetItem } from '@/modules/finance/domain/models/financial-types';

function DetailField({ label, value, valueClass }: { label: string; value: string; valueClass: string }) {
  return (
    <div>
      <span className="text-zinc-500 block">{label}</span>
      <span className={`${valueClass} font-medium`}>{value}</span>
    </div>
  );
}

export function AssetDetails({ asset }: { asset: LiveAssetItem }) {
  return (
    <div className="px-6 py-3 bg-zinc-900/40 border-t border-zinc-800/40 text-xs text-zinc-400 grid grid-cols-3 gap-4">
      <DetailField label="Instituição" value={asset.bankName} valueClass="text-white" />
      <DetailField label="Tipo" value={asset.type} valueClass="text-white" />
      <DetailField label="Status" value={asset.amount > 0 ? 'Ativo' : 'Inativo'} valueClass="text-emerald-400" />
    </div>
  );
}
