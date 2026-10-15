import type { EditableEntry } from '@/components/entries/entry-form-values';
import type { LiveAssetItem } from '@/modules/finance/domain/models/financial-types';

export function toEditableAsset(asset: LiveAssetItem): EditableEntry | null {
  if (asset.date === undefined) return null;
  return {
    kind: 'investment',
    id: asset.id,
    amount: asset.amount,
    description: asset.name,
    category: asset.type,
    date: asset.date,
  };
}
