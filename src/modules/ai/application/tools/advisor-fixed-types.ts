import type { ListFixedEntriesUseCase } from '@/modules/finance/application/fixed-entries/list-fixed-entries';
import type { CreateFixedEntryUseCase } from '@/modules/finance/application/fixed-entries/create-fixed-entry';
import type { UpdateFixedEntryUseCase } from '@/modules/finance/application/fixed-entries/update-fixed-entry';
import type { SetFixedEntryActiveUseCase } from '@/modules/finance/application/fixed-entries/set-fixed-entry-active';
import type { DeleteFixedEntryUseCase } from '@/modules/finance/application/fixed-entries/delete-fixed-entry';
import type { DeletionConfirmationService } from '../services/deletion-confirmation-service';

export type AdvisorFixedEntryServices = {
  list: Pick<ListFixedEntriesUseCase, 'execute'>;
  create: Pick<CreateFixedEntryUseCase, 'execute'>;
  update: Pick<UpdateFixedEntryUseCase, 'execute'>;
  setActive: Pick<SetFixedEntryActiveUseCase, 'execute'>;
  remove: Pick<DeleteFixedEntryUseCase, 'execute'>;
};

export type AdvisorFixedDeps = {
  userId: string;
  turnId: string;
  fixedEntries: AdvisorFixedEntryServices;
  deletion: DeletionConfirmationService;
};
