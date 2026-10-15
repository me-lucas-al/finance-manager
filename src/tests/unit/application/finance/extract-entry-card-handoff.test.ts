import { describe, it, expect, beforeEach } from 'vitest';
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
  let useCase: ExtractEntryWithAiUseCase;

  beforeEach(() => {
    llm = new FakeLanguageModel();
    useCase = new ExtractEntryWithAiUseCase(llm);
  });

  it.each(['paguei 300 de fatura', 'gastei 300 no cartão', 'comprei 300 no crédito', 'Fatura do Nubank 300'])(
    'hands over to the advisor so it can ask which card: %s',
    async (text) => {
      llm.nextStructuredResponse = extracted('expense', text);

      expect(await useCase.execute(text)).toEqual({ success: false, needsClarification: false });
    }
  );

  it('keeps registering plain expenses directly', async () => {
    llm.nextStructuredResponse = extracted('expense', 'almoço');

    const result = await useCase.execute('gastei 300 no almoço');

    expect(result).toMatchObject({ success: true, entry: { type: 'expense', amount: 300 } });
  });

  it('keeps registering incomes that mention credit', async () => {
    llm.nextStructuredResponse = extracted('income', 'crédito');

    const result = await useCase.execute('recebi 300 de crédito de reembolso');

    expect(result).toMatchObject({ success: true, entry: { type: 'income' } });
  });
});
