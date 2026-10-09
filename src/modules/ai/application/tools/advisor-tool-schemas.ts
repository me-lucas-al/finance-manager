export type BuscarLancamentosArgs = {
  periodo?: string;
  categoria?: string;
  tipo?: 'expense' | 'income' | 'investment';
};

export type TotalPorCategoriaArgs = {
  periodo?: string;
};

export type CompararPeriodosArgs = {
  periodoA: string;
  periodoB: string;
};

export type RegistrarLancamentoArgs = {
  tipo: 'expense' | 'income' | 'investment';
  categoria: string;
  descricao: string;
  valor: number;
};

export type DefinirLimiteArgs = {
  categoria: string;
  valor: number;
};

export type SalvarMemoriaArgs = {
  fato: string;
};

export const BUSCAR_LANCAMENTOS_SCHEMA = {
  type: 'object',
  properties: {
    periodo: { type: 'string', description: 'Mês no formato YYYY-MM' },
    tipo: { type: 'string', enum: ['expense', 'income', 'investment'] },
    categoria: { type: 'string' },
  },
};

export const TOTAL_POR_CATEGORIA_SCHEMA = {
  type: 'object',
  properties: {
    periodo: { type: 'string', description: 'Mês no formato YYYY-MM' },
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

export const REGISTRAR_LANCAMENTO_SCHEMA = {
  type: 'object',
  properties: {
    tipo: { type: 'string', enum: ['expense', 'income', 'investment'] },
    categoria: { type: 'string' },
    descricao: { type: 'string' },
    valor: { type: 'number' },
  },
  required: ['tipo', 'categoria', 'descricao', 'valor'],
};

export const DEFINIR_LIMITE_SCHEMA = {
  type: 'object',
  properties: {
    categoria: { type: 'string' },
    valor: { type: 'number' },
  },
  required: ['categoria', 'valor'],
};

export const SALVAR_MEMORIA_SCHEMA = {
  type: 'object',
  properties: {
    fato: { type: 'string' },
  },
  required: ['fato'],
};
