import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ExtractEntryWithAiUseCase } from '@/modules/finance/application/use-cases/extract-entry-with-ai';
import { FakeLanguageModel } from '@/tests/fakes/fake-language-model';

const extracted = (type: 'expense' | 'income', description: string) => ({
  isFinancialEntry: true,
  isAmbiguous: false,
  clarificationQuestion: null,
  type,
  category: 'Outros',
  description,
  amount: 300,
});

describe('ExtractEntryWithAiUseCase card handoff', () => {
  let llm: FakeLanguageModel;
  let cardNames: string[];
  let useCase: ExtractEntryWithAiUseCase;

  beforeEach(() => {
    llm = new FakeLanguageModel();
    cardNames = ['Nubank'];
    useCase = new ExtractEntryWithAiUseCase(llm, { listCardNames: vi.fn(async () => cardNames) });
  });

  const run = (type: 'expense' | 'income', text: string) => {
    llm.nextStructuredResponse = extracted(type, text);
    return useCase.execute(text, 'user-1');
  };

  it.each(['paguei 300 de fatura', 'gastei 300 no cartão', 'comprei 300 no crédito', 'Fatura do Nubank 300'])(
    'hands over to the advisor so it can ask which card: %s',
    async (text) => {
      expect(await run('expense', text)).toEqual({ success: false, needsClarification: false });
    }
  );

  it.each(['paguei fatura de luz 300', 'comprei cartão de visita 300', 'crédito no celular 300'])(
    'registers directly when it is not about a card: %s',
    async (text) => {
      expect(await run('expense', text)).toMatchObject({ success: true, entry: { type: 'expense', amount: 300 } });
    }
  );

  it('registers directly when the user has no cards, even for invoice wording', async () => {
    cardNames = [];

    expect(await run('expense', 'paguei 300 de fatura')).toMatchObject({ success: true });
  });

  it('keeps registering incomes that mention credit', async () => {
    expect(await run('income', 'recebi 300 no crédito')).toMatchObject({ success: true, entry: { type: 'income' } });
  });
});
