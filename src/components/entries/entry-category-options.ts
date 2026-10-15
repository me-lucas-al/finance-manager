import type { EntryType } from '@/modules/finance/domain/parsers/parse-entry-message';

export type CategoriesByType = Record<EntryType, string[]>;

const INCOME_CATEGORIES = ['Salário', 'Freelance', 'Rendimentos', 'Reembolso', 'Outros'];
const INVESTMENT_TYPES = ['CDB', 'Tesouro Direto', 'LCI', 'LCA', 'Ações', 'Fundos Imobiliários', 'Criptomoedas', 'Poupança'];

export function buildCategoriesByType(expenseCategories: string[]): CategoriesByType {
  return { expense: expenseCategories, income: INCOME_CATEGORIES, investment: INVESTMENT_TYPES };
}
