'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const TAB_LABEL = {
  transactions: 'Transações',
  incomes: 'Receitas',
  investments: 'Investimentos',
} as const;

export type MovementsTab = keyof typeof TAB_LABEL;

export function MovementsTabs({ tab, children }: { tab: MovementsTab; children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', value);
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Tabs value={tab} onValueChange={(value) => handleChange(value as string)}>
      <TabsList>
        {(Object.keys(TAB_LABEL) as MovementsTab[]).map((key) => (
          <TabsTrigger key={key} value={key}>{TAB_LABEL[key]}</TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value={tab}>{children}</TabsContent>
    </Tabs>
  );
}
