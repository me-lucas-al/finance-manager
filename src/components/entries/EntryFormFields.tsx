import { useId } from 'react';
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
  const uid = useId();
  const descriptionId = `${uid}-description`;
  const amountId = `${uid}-amount`;
  const categoryId = `${uid}-${categoryFieldName}`;
  const dateId = `${uid}-${dateFieldName}`;

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={descriptionId}>Descrição</Label>
        <Input id={descriptionId} name="description" defaultValue={defaultValues?.description} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor={amountId}>Valor (R$)</Label>
        <Input id={amountId} name="amount" type="number" step="0.01" defaultValue={defaultValues?.amount} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor={categoryId}>{categoryLabel}</Label>
        <Select name={categoryFieldName} defaultValue={defaultValues?.category}>
          <SelectTrigger id={categoryId} className="w-full">
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
        <Label htmlFor={dateId}>{dateLabel}</Label>
        <Input id={dateId} name={dateFieldName} type="datetime-local" defaultValue={defaultValues?.date} required />
      </div>
    </>
  );
}
