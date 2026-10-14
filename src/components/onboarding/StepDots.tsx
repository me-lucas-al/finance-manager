import { cn } from '@/lib/utils';

type StepDotsProps = {
  titles: string[];
  current: number;
  onSelect: (index: number) => void;
};

export function StepDots({ titles, current, onSelect }: StepDotsProps) {
  return (
    <div className="mt-5 flex items-center justify-center gap-2" role="tablist" aria-label="Passos">
      {titles.map((title, index) => (
        <button
          key={title}
          type="button"
          role="tab"
          aria-selected={index === current}
          aria-label={`Ir para o passo ${index + 1}`}
          onClick={() => onSelect(index)}
          className={cn(
            'h-2 rounded-full transition-all',
            index === current ? 'w-6 bg-blue-500' : 'w-2 bg-zinc-700 hover:bg-zinc-600',
          )}
        />
      ))}
    </div>
  );
}
