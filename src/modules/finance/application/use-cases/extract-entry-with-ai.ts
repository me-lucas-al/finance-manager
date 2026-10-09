import { ILanguageModel } from '@/modules/ai/domain/models/language-model';
import { ParsedEntry } from '../../domain/parsers/parse-entry-message';

export type AiExtractionResult =
  | { success: true; entry: ParsedEntry }
  | { success: false; needsClarification: true; question: string }
  | { success: false; needsClarification: false };

const EXTRACTION_SCHEMA = `{
  "isFinancialEntry": boolean,
  "isAmbiguous": boolean,
  "clarificationQuestion": string or null,
  "type": "expense" | "income" | "investment" | null,
  "category": string or null,
  "description": string or null,
  "amount": number or null
}`;

export class ExtractEntryWithAiUseCase {
  constructor(private llm: ILanguageModel) {}

  async execute(text: string): Promise<AiExtractionResult> {
    const prompt = `Analise a mensagem do usuário e identifique se trata-se de um registro de transação financeira (saída, entrada ou investimento).
Mensagem: "${text}"
Se o valor ou o tipo de transação for ambíguo ou faltar dado crítico para registrar, defina isAmbiguous=true e elabore uma pergunta direta em clarificationQuestion. Não invente valores.`;

    try {
      const parsed = await this.llm.generateStructured<{
        isFinancialEntry: boolean;
        isAmbiguous: boolean;
        clarificationQuestion: string | null;
        type: 'expense' | 'income' | 'investment' | null;
        category: string | null;
        description: string | null;
        amount: number | null;
      }>(prompt, EXTRACTION_SCHEMA, { tier: 'flash', temperature: 0.1 });

      if (!parsed.isFinancialEntry) {
        return { success: false, needsClarification: false };
      }

      if (parsed.isAmbiguous || !parsed.amount || !parsed.type) {
        return {
          success: false,
          needsClarification: true,
          question: parsed.clarificationQuestion || 'Poderia esclarecer o valor ou o tipo do lançamento?',
        };
      }

      return {
        success: true,
        entry: {
          type: parsed.type,
          category: parsed.category || 'Outros',
          description: parsed.description || text,
          amount: Math.abs(Number(parsed.amount)),
        },
      };
    } catch {
      return { success: false, needsClarification: false };
    }
  }
}
