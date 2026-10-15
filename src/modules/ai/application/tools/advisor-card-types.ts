import type { DataMode } from '@/modules/users/domain/models/user';
import type { CreateCreditCardUseCase } from '@/modules/finance/application/credit-cards/create-credit-card';
import type { DeleteCreditCardUseCase } from '@/modules/finance/application/credit-cards/delete-credit-card';
import type { ListCreditCardUsageUseCase } from '@/modules/finance/application/credit-cards/list-credit-card-usage';
import type { UpdateCreditCardUseCase } from '@/modules/finance/application/credit-cards/update-credit-card';
import type { DeletionConfirmationService } from '../services/deletion-confirmation-service';

export type AdvisorCreditCardServices = {
  readDataMode: (userId: string) => Promise<DataMode | null>;
  list: Pick<ListCreditCardUsageUseCase, 'execute'>;
  create: Pick<CreateCreditCardUseCase, 'execute'>;
  update: Pick<UpdateCreditCardUseCase, 'execute'>;
  remove: Pick<DeleteCreditCardUseCase, 'execute'>;
};

export type AdvisorCardDeps = {
  userId: string;
  turnId: string;
  creditCards: AdvisorCreditCardServices;
  deletion: DeletionConfirmationService;
};
