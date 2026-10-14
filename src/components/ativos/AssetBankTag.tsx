import { resolveBankBrand } from '@/components/shared/bank-brand';

interface AssetBankTagProps {
  bank: string;
  bankName: string;
}

export function AssetBankTag({ bank, bankName }: AssetBankTagProps) {
  const { background, label } = resolveBankBrand(bank, bankName);

  return (
    <span className={`h-3.5 px-1 ${background} text-white text-[9px] font-bold rounded flex items-center`}>
      {label}
    </span>
  );
}
