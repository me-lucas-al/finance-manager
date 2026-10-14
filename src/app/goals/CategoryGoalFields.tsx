import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CategoryGoalFieldsProps {
  idPrefix: string;
  categories: string[];
  categoryTargets: Record<string, number | null>;
}

export function CategoryGoalFields({ idPrefix, categories, categoryTargets }: CategoryGoalFieldsProps) {
  if (categories.length === 0) return null;

  return (
    <div className="space-y-2">
      <Label>Metas por categoria (opcional)</Label>
      <div className="grid gap-3 sm:grid-cols-2">
        {categories.map((category) => (
          <div key={category} className="space-y-1">
            <Label htmlFor={`${idPrefix}-${category}`} className="text-xs text-muted-foreground">
              {category}
            </Label>
            <Input
              id={`${idPrefix}-${category}`}
              name={`category__${category}`}
              type="number"
              step="0.01"
              defaultValue={categoryTargets[category] ?? undefined}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
