import { resolveBankBrand } from '@/components/shared/bank-brand';

interface BankBadgeProps {
  bank: string;
  accountName: string;
}

export function BankBadge({ bank, accountName }: BankBadgeProps) {
  const { background, label } = resolveBankBrand(bank, accountName);

  return (
    <div
      className={`h-7 w-7 rounded-md ${background} flex items-center justify-center font-bold text-[10px] text-white`}
    >
      {label}
    </div>
  );
}
