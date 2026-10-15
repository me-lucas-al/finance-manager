import { z } from 'zod';
import { ENTRY_NECESSITIES } from '../../domain/models/entry-necessity';
import { isValidEntryDate } from '../../domain/parsers/parse-entry-date';

const entryTypeSchema = z.enum(['expense', 'income', 'investment'], { error: 'Tipo de lançamento inválido' });
const amountSchema = z.number({ error: 'Valor inválido' }).finite('Valor inválido').positive('Valor deve ser maior que zero');
const descriptionSchema = z.string({ error: 'Informe a descrição' }).trim().min(1, 'Informe a descrição');
const categorySchema = z.string({ error: 'Informe a categoria' }).trim().min(1, 'Informe a categoria');
const dateSchema = z.string({ error: 'Data inválida' }).refine(isValidEntryDate, 'Data inválida');
const necessitySchema = z.enum(ENTRY_NECESSITIES, { error: 'Necessidade inválida' });
const creditCardIdSchema = z.string({ error: 'Cartão inválido' }).min(1, 'Cartão inválido');
const entryIdSchema = z.string({ error: 'Lançamento inválido' }).min(1, 'Lançamento inválido');

export const createEntrySchema = z.object({
  type: entryTypeSchema,
  amount: amountSchema,
  description: descriptionSchema,
  category: categorySchema,
  date: dateSchema.optional(),
  necessity: necessitySchema.optional(),
  creditCardId: creditCardIdSchema.optional(),
});

export const updateEntrySchema = z.object({
  kind: entryTypeSchema,
  id: entryIdSchema,
  changes: z.object({
    amount: amountSchema.optional(),
    description: descriptionSchema.optional(),
    category: categorySchema.optional(),
    date: dateSchema.optional(),
    necessity: necessitySchema.optional(),
    creditCardId: creditCardIdSchema.nullable().optional(),
  }),
});

export const deleteEntrySchema = z.object({ kind: entryTypeSchema, id: entryIdSchema });
