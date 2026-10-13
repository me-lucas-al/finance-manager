export type DefinirLimiteArgs = {
  categoria: string;
  valor: number;
};

export type SalvarMemoriaArgs = {
  fato: string;
};

export type AtualizarMetasArgs = {
  mensagem: string;
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

export const ATUALIZAR_METAS_SCHEMA = {
  type: 'object',
  properties: {
    mensagem: {
      type: 'string',
      description:
        'Pedido do usuário sobre metas, em linguagem natural. Ex.: "teto de 3000 no mês e 400 em delivery" ou "guardar 5000 para viagem até dezembro".',
    },
  },
  required: ['mensagem'],
};
