import { GoogleGenAI, Type } from '@google/genai';

let client: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (client) return client;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('Gemini is not configured (missing GEMINI_API_KEY).');
  client = new GoogleGenAI({ apiKey });
  return client;
}

const MODEL = 'gemini-2.5-flash';

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
