import { TransactionRepository } from '@/modules/open-finance/domain/repositories/transaction-repository';
import { IncomeRepository } from '../../domain/repositories/income-repository';
import { InvestmentRepository } from '../../domain/repositories/investment-repository';

export class UndoLastEntryService {
  constructor(
    private transactionRepo: TransactionRepository,
    private incomeRepo: IncomeRepository,
    private investmentRepo: InvestmentRepository
  ) {}

  async execute(userId: string): Promise<string> {
    const [latestTx, latestInc, latestInv] = await Promise.all([
      this.transactionRepo.findLatestByUserId(userId),
      this.incomeRepo.findLatestByUserId(userId),
      this.investmentRepo.findLatestByUserId(userId),
    ]);

    const candidates = [
      latestTx && latestTx.source === 'manual'
        ? { type: 'expense' as const, id: latestTx.id, time: new Date(latestTx.createdAt).getTime(), desc: latestTx.description, amount: latestTx.amount }
        : null,
      latestInc ? { type: 'income' as const, id: latestInc.id, time: new Date(latestInc.createdAt).getTime(), desc: latestInc.description, amount: Number(latestInc.amount) } : null,
      latestInv ? { type: 'investment' as const, id: latestInv.id, time: new Date(latestInv.createdAt).getTime(), desc: latestInv.description, amount: Number(latestInv.amount) } : null,
    ].filter((c): c is NonNullable<typeof c> => c !== null);

    if (candidates.length === 0) {
      return 'Nenhum lançamento encontrado para desfazer.';
    }

    candidates.sort((a, b) => b.time - a.time);
    const newest = candidates[0];

    if (newest.type === 'expense') {
      await this.transactionRepo.delete(newest.id);
    } else if (newest.type === 'income') {
      await this.incomeRepo.delete(newest.id);
    } else {
      await this.investmentRepo.delete(newest.id);
    }

    return `🗑️ Lançamento desfeito com sucesso:\n${newest.type.toUpperCase()}: ${newest.desc} - R$ ${newest.amount.toFixed(2)}`;
  }
}
