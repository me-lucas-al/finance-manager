import { useState } from 'react';
import type { FixedEntryView } from '@/modules/finance/domain/models/fixed-entry';
import {
  initialFixedEntryFormValues,
  parseFixedEntryForm,
  type FixedEntryFormPayload,
  type FixedEntryFormValues,
} from './fixed-entry-form-values';

export function useFixedEntryForm(entry?: FixedEntryView) {
  const [values, setValues] = useState<FixedEntryFormValues>(() => initialFixedEntryFormValues(entry));
  const [formError, setFormError] = useState<string | null>(null);

  const setField = <K extends keyof FixedEntryFormValues>(key: K, value: FixedEntryFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const parse = (): FixedEntryFormPayload | null => {
    const parsed = parseFixedEntryForm(values);
    if ('error' in parsed) {
      setFormError(parsed.error);
      return null;
    }
    setFormError(null);
    return parsed.payload;
  };

  return { values, setField, parse, formError };
}
