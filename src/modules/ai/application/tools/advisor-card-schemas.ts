export type CadastrarCartaoArgs = {
  nome: string;
  limite: number;
  final?: string;
  dia_fechamento?: number;
};

export type EditarCartaoArgs = {
  id: string;
  nome?: string;
  limite?: number;
  final?: string;
  dia_fechamento?: number;
};

export type ExcluirCartaoArgs = { id: string; confirmacao?: string };

const ID_PROPERTY = { type: 'string', description: 'id retornado por listar_cartoes' };
const DIGITS_PROPERTY = { type: 'string', description: 'Quatro últimos dígitos do cartão.' };
const CLOSING_PROPERTY = { type: 'number', description: 'Dia do mês em que a fatura fecha, de 1 a 31.' };
const CLEARABLE_DIGITS = { type: 'string', description: 'Quatro últimos dígitos; string vazia remove o final.' };
const CLEARABLE_CLOSING = { type: 'number', description: 'Dia de fechamento de 1 a 31; 0 remove o dia de fechamento.' };

export const LISTAR_CARTOES_SCHEMA = { type: 'object', properties: {} };

export const CADASTRAR_CARTAO_SCHEMA = {
  type: 'object',
  properties: {
    nome: { type: 'string', description: 'Nome do cartão, ex.: Nubank.' },
    limite: { type: 'number', description: 'Limite total do cartão em reais.' },
    final: DIGITS_PROPERTY,
    dia_fechamento: CLOSING_PROPERTY,
  },
  required: ['nome', 'limite'],
};

export const EDITAR_CARTAO_SCHEMA = {
  type: 'object',
  properties: {
    id: ID_PROPERTY,
    nome: { type: 'string' },
    limite: { type: 'number' },
    final: CLEARABLE_DIGITS,
    dia_fechamento: CLEARABLE_CLOSING,
  },
  required: ['id'],
};

export const EXCLUIR_CARTAO_SCHEMA = {
  type: 'object',
  properties: {
    id: ID_PROPERTY,
    confirmacao: {
      type: 'string',
      description:
        'Token recebido na resposta anterior de excluir_cartao. Envie somente depois que o usuário confirmar a exclusão em uma NOVA mensagem.',
    },
  },
  required: ['id'],
};
