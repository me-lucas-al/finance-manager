import type { EntryKindArg } from './advisor-query-schemas';

export type RegistrarLancamentoArgs = {
  tipo: EntryKindArg;
  categoria: string;
  descricao: string;
  valor: number;
  data?: string;
};

export type EditarLancamentoArgs = {
  id: string;
  tipo: EntryKindArg;
  valor?: number;
  descricao?: string;
  categoria?: string;
  data?: string;
};

export type ExcluirLancamentoArgs = {
  id: string;
  tipo: EntryKindArg;
  confirmado?: boolean;
};

const KIND_PROPERTY = { type: 'string', enum: ['expense', 'income', 'investment'] };
const DATE_PROPERTY = {
  type: 'string',
  description: 'Data do lançamento no formato YYYY-MM-DD. Omita para usar hoje.',
};

export const REGISTRAR_LANCAMENTO_SCHEMA = {
  type: 'object',
  properties: {
    tipo: KIND_PROPERTY,
    categoria: { type: 'string' },
    descricao: { type: 'string' },
    valor: { type: 'number' },
    data: DATE_PROPERTY,
  },
  required: ['tipo', 'categoria', 'descricao', 'valor'],
};

export const EDITAR_LANCAMENTO_SCHEMA = {
  type: 'object',
  properties: {
    id: { type: 'string', description: 'id retornado por buscar_lancamentos' },
    tipo: KIND_PROPERTY,
    valor: { type: 'number' },
    descricao: { type: 'string' },
    categoria: { type: 'string' },
    data: DATE_PROPERTY,
  },
  required: ['id', 'tipo'],
};

export const EXCLUIR_LANCAMENTO_SCHEMA = {
  type: 'object',
  properties: {
    id: { type: 'string', description: 'id retornado por buscar_lancamentos' },
    tipo: KIND_PROPERTY,
    confirmado: {
      type: 'boolean',
      description: 'true somente depois que o usuário confirmou explicitamente a exclusão',
    },
  },
  required: ['id', 'tipo'],
};
