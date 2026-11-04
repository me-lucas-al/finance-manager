import { groupConnectedBanks, type ConnectedBank } from '../../domain/connected-bank';
import type { AccountRepository } from '../../domain/repositories/account-repository';

export class ListConnectedBanksUseCase {
  constructor(private readonly accounts: Pick<AccountRepository, 'findAllByUserId'>) {}

  async execute(userId: string): Promise<ConnectedBank[]> {
    return groupConnectedBanks(await this.accounts.findAllByUserId(userId));
  }
}
