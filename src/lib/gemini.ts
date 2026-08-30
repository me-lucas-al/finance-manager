import { GoogleGenAI, Type } from '@google/genai';

let client: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (client) return client;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('Gemini is not configured (missing GEMINI_API_KEY).');
  client = new GoogleGenAI({ apiKey });
  return client;
}

const MODEL = 'gemini-3.6-flash';

export type CategorySuggestion = {
  category: string;
};

// Constrained to the caller's own category list (the same `expenseCategories`
// already configurable in Settings — see src/db/schema/index.ts:userSettings)
// so auto-synced transactions never introduce categories the rest of the app
// doesn't know about.
export async function suggestCategory(params: {
  description: string;
  amount: number;
  bank: string;
  categories: string[];
}): Promise<CategorySuggestion> {
  const { description, amount, bank, categories } = params;

  const response = await getGeminiClient().models.generateContent({
    model: MODEL,
    contents: [
      'Categorize esta transação financeira em exatamente uma das categorias fornecidas.',
      `Descrição: ${description}`,
      `Valor: ${amount}`,
      `Banco: ${bank}`,
      `Categorias disponíveis: ${categories.join(', ')}`,
    ].join('\n'),
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING, format: 'enum', enum: categories },
        },
        required: ['category'],
      },
    },
  });

  const parsed = JSON.parse(response.text ?? '{}') as { category?: string };
  const category = parsed.category && categories.includes(parsed.category) ? parsed.category : categories[0];
  return { category };
}

export type ReasonInterpretation = {
  category: string;
  reason: string | null;
};

// Interprets the user's free-text reply to the Telegram question: keeps the
// suggested category unless the reply clearly points to a different one, and
// extracts the purchase reason (null when the reply is just a confirmation).
export async function interpretReasonReply(params: {
  replyText: string;
  categorySuggested: string;
  categories: string[];
}): Promise<ReasonInterpretation> {
  const { replyText, categorySuggested, categories } = params;

  const response = await getGeminiClient().models.generateContent({
    model: MODEL,
    contents: [
      'O usuário respondeu, no Telegram, a uma pergunta sobre uma transação financeira.',
      `Categoria sugerida inicialmente: ${categorySuggested}`,
      `Resposta do usuário: "${replyText}"`,
      'Se a resposta confirmar a categoria sugerida ou não mencionar outra categoria, mantenha a sugerida.',
      'Se a resposta indicar claramente outra categoria (dentre as disponíveis), use essa.',
      'Extraia o motivo da compra do texto livre; se a resposta for apenas uma confirmação sem detalhe (ex: "sim", "confirmado", "ok"), deixe reason como uma string vazia.',
      `Categorias disponíveis: ${categories.join(', ')}`,
    ].join('\n'),
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING, format: 'enum', enum: categories },
          reason: { type: Type.STRING },
        },
        required: ['category', 'reason'],
      },
    },
  });

  const parsed = JSON.parse(response.text ?? '{}') as { category?: string; reason?: string };
  const category =
    parsed.category && categories.includes(parsed.category) ? parsed.category : categorySuggested;
  const reason = parsed.reason && parsed.reason.trim().length > 0 ? parsed.reason.trim() : null;
  return { category, reason };
}

export type GoalsReplyInterpretation = {
  monthlyGeneralTarget: number | null;
  monthlyCategoryTargets: { category: string; amount: number }[];
  savingsGoalUpdates: {
    title: string;
    targetAmount: number | null;
    targetDate: string | null;
    contributionAmount: number | null;
  }[];
};

// Interprets a free-text reply about financial goals (day-16 prompt or
// /goal): extracts what the user wants to set, but leaves the create-vs-update
// decision for savings goals to the caller (see RecordGoalsReplyUseCase),
// which can compare titles against the user's existing goals.
export async function interpretGoalsReply(params: {
  replyText: string;
  categories: string[];
  existingSavingsGoals: string[];
}): Promise<GoalsReplyInterpretation> {
  const { replyText, categories, existingSavingsGoals } = params;

  const response = await getGeminiClient().models.generateContent({
    model: MODEL,
    contents: [
      'O usuário respondeu, no Telegram, sobre seus objetivos financeiros: metas de gasto mensal (teto geral e/ou por categoria) e/ou metas de economia com prazo.',
      `Resposta do usuário: "${replyText}"`,
      `Categorias de gasto disponíveis: ${categories.join(', ')}`,
      existingSavingsGoals.length > 0
        ? `Metas de economia já em andamento: ${existingSavingsGoals.join(', ')}`
        : 'Nenhuma meta de economia em andamento ainda.',
      'Extraia:',
      '- monthlyGeneralTarget: teto geral de gasto mensal, se mencionado (null se não mencionado).',
      '- monthlyCategoryTargets: lista de {category, amount} para metas de gasto por categoria mencionadas (category deve ser uma das categorias disponíveis).',
      '- savingsGoalUpdates: lista de atualizações de metas de economia mencionadas. Para cada uma, informe "title" (reutilize o título de uma meta já em andamento se a resposta claramente se referir a ela, mesmo com nome parecido; senão crie um título novo e curto), "targetAmount" (valor total do objetivo, null se não mencionado), "targetDate" (data limite em formato ISO YYYY-MM-DD, null se não mencionado) e "contributionAmount" (valor a somar ao total já guardado, null se não houve aporte mencionado).',
      'Se a resposta não mencionar um desses tópicos, deixe o campo/array correspondente vazio ou null.',
    ].join('\n'),
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          monthlyGeneralTarget: { type: Type.NUMBER, nullable: true },
          monthlyCategoryTargets: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING, format: 'enum', enum: categories },
                amount: { type: Type.NUMBER },
              },
              required: ['category', 'amount'],
            },
          },
          savingsGoalUpdates: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                targetAmount: { type: Type.NUMBER, nullable: true },
                targetDate: { type: Type.STRING, nullable: true },
                contributionAmount: { type: Type.NUMBER, nullable: true },
              },
              required: ['title', 'targetAmount', 'targetDate', 'contributionAmount'],
            },
          },
        },
        required: ['monthlyGeneralTarget', 'monthlyCategoryTargets', 'savingsGoalUpdates'],
      },
    },
  });

  const parsed = JSON.parse(response.text ?? '{}') as Partial<GoalsReplyInterpretation>;
  return {
    monthlyGeneralTarget: parsed.monthlyGeneralTarget ?? null,
    monthlyCategoryTargets: (parsed.monthlyCategoryTargets ?? []).filter((target) =>
      categories.includes(target.category),
    ),
    savingsGoalUpdates: parsed.savingsGoalUpdates ?? [],
  };
}
