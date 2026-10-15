import type { DataMode } from '@/modules/users/domain/models/user';
import type { ListCreditCardUsageUseCase } from './list-credit-card-usage';
import { formatCreditCardsMessage, PLUGGY_CARDS_MESSAGE } from './credit-card-message-formatter';

export class ShowCreditCardsUseCase {
  constructor(
    private readonly readDataMode: (userId: string) => Promise<DataMode | null>,
    private readonly listUsage: Pick<ListCreditCardUsageUseCase, 'execute'>
  ) {}

  async execute(userId: string): Promise<string> {
    if ((await this.readDataMode(userId)) !== 'manual') return PLUGGY_CARDS_MESSAGE;
    return formatCreditCardsMessage(await this.listUsage.execute(userId));
  }
}
