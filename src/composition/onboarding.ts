import { ChooseDataModeUseCase } from '@/modules/onboarding/application/choose-data-mode';
import { DrizzleDataModeStore } from '@/modules/onboarding/infrastructure/drizzle-data-mode-store';
import { LedgerResetter } from '@/modules/onboarding/infrastructure/ledger-resetter';

export const dataModeStore = new DrizzleDataModeStore();
export const chooseDataModeUseCase = new ChooseDataModeUseCase(dataModeStore, new LedgerResetter());
