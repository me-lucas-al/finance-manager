interface BankBrand {
  background: string;
  label?: string;
}

const KNOWN_BANKS: Record<string, BankBrand> = {
  itau: { background: 'bg-[#002f6c]', label: 'itaú' },
  nubank: { background: 'bg-[#820ad1]', label: 'nu' },
  inter: { background: 'bg-[#ff7a00]', label: 'inter' },
};

const FALLBACK_BANK: BankBrand = { background: 'bg-zinc-700' };

export function resolveBankBrand(bank: string, displayName: string): { background: string; label: string } {
  const brand = KNOWN_BANKS[bank] ?? FALLBACK_BANK;
  return { background: brand.background, label: brand.label ?? displayName.slice(0, 2).toUpperCase() };
}
