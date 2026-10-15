import { useState } from 'react';
import type { CreditCard } from '@/modules/finance/domain/models/credit-card';
import {
  initialCreditCardFormValues,
  parseCreditCardForm,
  type CreditCardFormPayload,
  type CreditCardFormValues,
} from './credit-card-form-values';

export function useCreditCardForm(card?: CreditCard) {
  const [values, setValues] = useState<CreditCardFormValues>(() => initialCreditCardFormValues(card));
  const [formError, setFormError] = useState<string | null>(null);

  const setField = <K extends keyof CreditCardFormValues>(key: K, value: CreditCardFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const parse = (): CreditCardFormPayload | null => {
    const parsed = parseCreditCardForm(values);
    if ('error' in parsed) {
      setFormError(parsed.error);
      return null;
    }
    setFormError(null);
    return parsed.payload;
  };

  return { values, setField, parse, formError };
}
