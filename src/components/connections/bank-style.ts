import { KNOWN_BANK_NAMES } from '@/lib/pluggy';

export type ItemStatusPresentation = {
  label: string;
  variant: 'default' | 'destructive' | 'outline';
  className?: string;
};

const BANK_ACCENT: Record<string, string> = {
  itau: 'bg-[#EC7000]',
  nubank: 'bg-[#820AD1]',
  inter: 'bg-[#FF7A00]',
};

export function bankAccentClass(bank: string): string {
  return BANK_ACCENT[bank] ?? 'bg-primary';
}

export function bankLabel(bank: string): string {
  return KNOWN_BANK_NAMES[bank] ?? bank;
}

export function itemStatusPresentation(itemStatus: string | null): ItemStatusPresentation {
  if (itemStatus === 'UPDATED') {
    return { label: 'Conectado', variant: 'outline', className: 'border-transparent bg-positive/10 text-positive' };
  }
  if (itemStatus === 'LOGIN_ERROR' || itemStatus === 'OUTDATED') {
    return { label: 'Erro', variant: 'destructive' };
  }
  return { label: 'Atualizando', variant: 'default' };
}
