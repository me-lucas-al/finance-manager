export type CadastrarFixoArgs = {
  tipo: 'expense' | 'income';
  descricao: string;
  categoria: string;
  valor: number;
  dia_vencimento: number;
  lancar_neste_mes?: boolean;
};

export type EditarFixoArgs = {
  id: string;
  valor?: number;
  descricao?: string;
  categoria?: string;
  dia_vencimento?: number;
  aplicar_ao_mes_atual?: boolean;
};

export type PausarFixoArgs = { id: string; pausado?: boolean };

export type ExcluirFixoArgs = { id: string; tambem_do_mes?: boolean; confirmacao?: string };

const ID_PROPERTY = { type: 'string', description: 'id retornado por listar_fixos' };
const DUE_DAY_PROPERTY = { type: 'number', description: 'Dia do mês do vencimento, de 1 a 31.' };

export const LISTAR_FIXOS_SCHEMA = { type: 'object', properties: {} };

export const CADASTRAR_FIXO_SCHEMA = {
  type: 'object',
  properties: {
    tipo: { type: 'string', enum: ['expense', 'income'] },
    descricao: { type: 'string' },
    categoria: { type: 'string' },
    valor: { type: 'number' },
    dia_vencimento: DUE_DAY_PROPERTY,
    lancar_neste_mes: {
      type: 'boolean',
      description: 'Quando o vencimento deste mês já passou, lança também neste mês. Padrão: true.',
    },
  },
  required: ['tipo', 'descricao', 'categoria', 'valor', 'dia_vencimento'],
};

export const EDITAR_FIXO_SCHEMA = {
  type: 'object',
  properties: {
    id: ID_PROPERTY,
    valor: { type: 'number' },
    descricao: { type: 'string' },
    categoria: { type: 'string' },
    dia_vencimento: DUE_DAY_PROPERTY,
    aplicar_ao_mes_atual: {
      type: 'boolean',
      description: 'Altera também o lançamento já gerado neste mês. Padrão: false (vale daqui para frente).',
    },
  },
  required: ['id'],
};

export const PAUSAR_FIXO_SCHEMA = {
  type: 'object',
  properties: {
    id: ID_PROPERTY,
    pausado: { type: 'boolean', description: 'true pausa (padrão), false reativa.' },
  },
  required: ['id'],
};

export const EXCLUIR_FIXO_SCHEMA = {
  type: 'object',
  properties: {
    id: ID_PROPERTY,
    tambem_do_mes: {
      type: 'boolean',
      description: 'Exclui também o lançamento já gerado neste mês. Padrão: false (mantém os lançamentos).',
    },
    confirmacao: {
      type: 'string',
      description:
        'Token recebido na resposta anterior de excluir_fixo. Envie somente depois que o usuário confirmar a exclusão em uma NOVA mensagem.',
    },
  },
  required: ['id'],
};
