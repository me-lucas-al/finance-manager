export const REFUND = /\b(estorno|reembolso|refund|cancelamento|devolu[cç][aã]o)\b/i;

export const CREDIT_CARD_PAYMENT_DESCRIPTION =
  /(pag(amento|to)?\s*(de\s*)?(fatura|cart[aã]o)|fatura\s*(cart[aã]o|nubank|ita[uú]|inter|bradesco|santander|c6)|(itaucard|nubank|inter)\s*pagamento|pgto\s*eletr\s*cobranca|pagamento\s*fatura|pagamento\s*recebido)/i;

export const CREDIT_CARD_PAYMENT_CATEGORY =
  /(credit\s*card\s*payment|pagamento\s*de\s*fatura|cart[aã]o\s*de\s*cr[eé]dito)/i;

export const INVESTMENT_DESCRIPTION =
  /(\b(cdb|rdb|lci|lca|tesouro(\s*direto)?|nuinvest|inter\s*dtvm|xp\s*investimentos|caixinha|caixinhas|cofrinho|cofrinhos)\b)|(aplica[cç][aã]o\s*(financeira|investimento|caixinha|cdb|rdb|fundo|poupanca|poupança)?)|(resgate\s*(caixinha|investimento|cdb|rdb|fundo|aplica[cç][aã]o|poupan[cç]a|tesouro|cofrinho)?)|(dinheiro\s*(reservado|retirado|guardado))/i;

export const INVESTMENT_CATEGORY = /^(investments?|investimentos?|aplica[cç][oõ]es)$/i;

export const INTERNAL_TRANSFER_DESCRIPTION =
  /(mesma\s*titularidade|entre\s*contas|mesmo\s*titular|transf.*propria|transfer[eê]ncia\s*para\s*mesma)/i;

export const TRANSFER_OR_PIX = /(transfer[eê]ncia|transf|pix|ted|doc)/i;
