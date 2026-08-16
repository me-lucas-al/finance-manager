import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface EntryFormDefaultValues {
  description?: string;
  amount?: number;
  category?: string;
  date?: string;
}

interface EntryFormFieldsProps {
  categoryLabel: string;
  categoryFieldName: string;
  categoryOptions: string[];
  dateFieldName: string;
  dateLabel: string;
  defaultValues?: EntryFormDefaultValues;
}

export function EntryFormFields({
  categoryLabel,
  categoryFieldName,
  categoryOptions,
  dateFieldName,
  dateLabel,
  defaultValues,
}: EntryFormFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Input id="description" name="description" defaultValue={defaultValues?.description} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="amount">Valor (R$)</Label>
        <Input id="amount" name="amount" type="number" step="0.01" defaultValue={defaultValues?.amount} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor={categoryFieldName}>{categoryLabel}</Label>
        <Select name={categoryFieldName} defaultValue={defaultValues?.category}>
          <SelectTrigger id={categoryFieldName} className="w-full">
            <SelectValue placeholder={`Selecione ${categoryLabel.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {categoryOptions.map((option) => (
              <SelectItem key={option} value={option}>{option}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor={dateFieldName}>{dateLabel}</Label>
        <Input id={dateFieldName} name={dateFieldName} type="datetime-local" defaultValue={defaultValues?.date} required />
      </div>
    </>
  );
}
