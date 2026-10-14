export type EntryKindArg = 'expense' | 'income' | 'investment';

export type BuscarLancamentosArgs = {
  periodo?: string;
  categoria?: string;
  tipo?: EntryKindArg;
  texto?: string;
  limite?: number;
};

export type TotalPorCategoriaArgs = {
  periodo?: string;
  tipo?: EntryKindArg;
};

export type CompararPeriodosArgs = {
  periodoA: string;
  periodoB: string;
};

const KIND_PROPERTY = {
  type: 'string',
  enum: ['expense', 'income', 'investment'],
  description: 'expense (saída), income (entrada) ou investment (investimento)',
};

export const BUSCAR_LANCAMENTOS_SCHEMA = {
  type: 'object',
  properties: {
    periodo: { type: 'string', description: 'Mês no formato YYYY-MM' },
    categoria: { type: 'string', description: 'Nome da categoria' },
    tipo: KIND_PROPERTY,
    texto: { type: 'string', description: 'Termo na descrição, ex.: nome do estabelecimento' },
    limite: { type: 'number', description: 'Máximo de itens (padrão 20, máximo 50)' },
  },
};

export const TOTAL_POR_CATEGORIA_SCHEMA = {
  type: 'object',
  properties: {
    periodo: { type: 'string', description: 'Mês no formato YYYY-MM (padrão: mês atual)' },
    tipo: KIND_PROPERTY,
  },
};

export const COMPARAR_PERIODOS_SCHEMA = {
  type: 'object',
  properties: {
    periodoA: { type: 'string', description: 'Primeiro mês (YYYY-MM)' },
    periodoB: { type: 'string', description: 'Segundo mês (YYYY-MM)' },
  },
  required: ['periodoA', 'periodoB'],
};

export const SEM_PARAMETROS_SCHEMA = { type: 'object', properties: {} };
