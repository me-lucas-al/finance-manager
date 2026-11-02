import type { ListCreditCardUsageUseCase } from './list-credit-card-usage';
import { formatCreditCardsMessage } from './credit-card-message-formatter';

export class ShowCreditCardsUseCase {
  constructor(private readonly listUsage: Pick<ListCreditCardUsageUseCase, 'execute'>) {}

  async execute(userId: string): Promise<string> {
    return formatCreditCardsMessage(await this.listUsage.execute(userId));
  }
}
