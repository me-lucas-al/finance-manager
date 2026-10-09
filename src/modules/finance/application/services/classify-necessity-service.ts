import { TransactionNecessity, TransactionRepository } from '@/modules/open-finance/domain/repositories/transaction-repository';
import { ILanguageModel } from '@/modules/ai/domain/models/language-model';

const necessityCache = new Map<string, TransactionNecessity>();

const NECESSITY_SCHEMA = `{"necessity": "essencial" | "importante" | "superfluo"}`;

export class ClassifyNecessityService {
  constructor(
    private transactionRepo: TransactionRepository,
    private llm: ILanguageModel
  ) {}

  async execute(userId: string, category: string, description: string): Promise<TransactionNecessity> {
    const key = category.toLowerCase().trim();
    if (necessityCache.has(key)) {
      return necessityCache.get(key)!;
    }

    const past = await this.transactionRepo.findAllByUserId(userId, { category, limit: 5 });
    const pastNecessity = past.find((t) => t.necessity)?.necessity;
    if (pastNecessity) {
      necessityCache.set(key, pastNecessity);
      return pastNecessity;
    }

    try {
      const prompt = `Classifique a necessidade deste gasto financeiro em apenas um destes 3 valores:
- essencial: contas básicas, alimentação básica, saúde, moradia.
- importante: transporte, educação, manutenção necessária.
- superfluo: delivery frequente, lazer supérfluo, compras por impulso, streaming extra.
Categoria: "${category}", Descrição: "${description}".`;

      const result = await this.llm.generateStructured<{ necessity: TransactionNecessity }>(
        prompt,
        NECESSITY_SCHEMA,
        { tier: 'flash', temperature: 0.1 }
      );

      const resolved = result.necessity || 'importante';
      necessityCache.set(key, resolved);
      return resolved;
    } catch {
      return 'importante';
    }
  }
}
