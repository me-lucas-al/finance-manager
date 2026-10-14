import type { GoalsReplyInput } from '@/modules/open-finance/domain/ports/goals-reply-interpreter';

function describeExistingGoals(existingSavingsGoals: string[]): string {
  if (existingSavingsGoals.length === 0) return 'Nenhuma meta de economia em andamento ainda.';
  return `Metas de economia já em andamento: ${existingSavingsGoals.join(', ')}`;
}

export function buildGoalsReplyPrompt({ replyText, categories, existingSavingsGoals }: GoalsReplyInput): string {
  return [
    'O usuário respondeu, no Telegram, sobre seus objetivos financeiros: metas de gasto mensal (teto geral e/ou por categoria) e/ou metas de economia com prazo.',
    `Resposta do usuário: "${replyText}"`,
    `Categorias de gasto disponíveis: ${categories.join(', ')}`,
    describeExistingGoals(existingSavingsGoals),
    'Extraia:',
    '- monthlyGeneralTarget: teto geral de gasto mensal, se mencionado (null se não mencionado).',
    '- monthlyCategoryTargets: lista de {category, amount} para metas de gasto por categoria mencionadas (category deve ser uma das categorias disponíveis).',
    '- savingsGoalUpdates: lista de atualizações de metas de economia mencionadas. Para cada uma, informe "title" (reutilize o título de uma meta já em andamento se a resposta claramente se referir a ela, mesmo com nome parecido; senão crie um título novo e curto), "targetAmount" (valor total do objetivo, null se não mencionado), "targetDate" (data limite em formato ISO YYYY-MM-DD, null se não mencionado) e "contributionAmount" (valor a somar ao total já guardado, null se não houve aporte mencionado).',
    'Se a resposta não mencionar um desses tópicos, deixe o campo/array correspondente vazio ou null.',
  ].join('\n');
}
