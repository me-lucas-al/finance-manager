import { ResolveCurrentPeriodUseCase } from '@/modules/periods/application/use-cases/resolve-current-period';
import { DrizzlePeriodRepository } from '@/modules/periods/infrastructure/drizzle-period-repository';
import { DrizzlePeriodSnapshotRepository } from '@/modules/periods/infrastructure/drizzle-period-snapshot-repository';
import { settingRepository } from './users';

export const periodRepository = new DrizzlePeriodRepository();
export const periodSnapshotRepository = new DrizzlePeriodSnapshotRepository();
export const resolveCurrentPeriod = new ResolveCurrentPeriodUseCase(periodRepository, settingRepository);
