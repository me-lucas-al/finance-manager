import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Amount } from '@/components/shared/Amount';
import type { LiveExpenseCategory } from '@/modules/finance/domain/models/financial-types';

interface ExpenseCategoryCardProps {
  title: string;
  icon: ReactNode;
  accentClass: string;
  total: number;
  subtitle: string;
  emptyMessage: string;
  categories: LiveExpenseCategory[];
}

export function ExpenseCategoryCard(props: ExpenseCategoryCardProps) {
  return (
    <Card className="bg-[#111216] border-zinc-800/80 rounded-2xl shadow-sm hover:border-zinc-700/60 transition-colors">
      <CardHeader className="pb-3 pt-6 px-6">
        <div className={`flex items-center gap-2 ${props.accentClass} text-xs font-bold uppercase tracking-wider`}>
          {props.icon}
          <span>{props.title}</span>
        </div>
        <div className="mt-2">
          <Amount value={props.total} className={`text-3xl font-bold tracking-tight ${props.accentClass}`} />
        </div>
        <p className="text-xs text-zinc-400 mt-0.5">{props.subtitle}</p>
      </CardHeader>
      <CardContent className="px-6 pb-6 pt-2 space-y-4">
        {props.categories.length === 0 && <p className="text-xs text-zinc-500">{props.emptyMessage}</p>}
        {props.categories.map((category) => (
          <div key={category.name} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-200 font-medium">{category.name}</span>
              <Amount value={category.amount} className="text-zinc-300 font-medium" />
            </div>
            <div className="h-1.5 w-full bg-zinc-800/80 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${category.color}`}
                style={{ width: `${category.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
