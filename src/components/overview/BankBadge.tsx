interface BankBadgeStyle {
  background: string;
  textSize: string;
  label?: string;
}

const KNOWN_BANKS: Record<string, BankBadgeStyle> = {
  itau: { background: 'bg-[#002f6c]', textSize: 'text-[10px]', label: 'itaú' },
  nubank: { background: 'bg-[#820ad1]', textSize: 'text-[11px]', label: 'nu' },
  inter: { background: 'bg-[#ff7a00]', textSize: 'text-[10px]', label: 'inter' },
};

const FALLBACK_BANK: BankBadgeStyle = { background: 'bg-zinc-700', textSize: 'text-[10px]' };

interface BankBadgeProps {
  bank: string;
  accountName: string;
}

export function BankBadge({ bank, accountName }: BankBadgeProps) {
  const style = KNOWN_BANKS[bank] ?? FALLBACK_BANK;
  const label = style.label ?? accountName.slice(0, 2).toUpperCase();

  return (
    <div
      className={`h-7 w-7 rounded-md ${style.background} flex items-center justify-center font-bold ${style.textSize} text-white`}
    >
      {label}
    </div>
  );
}
