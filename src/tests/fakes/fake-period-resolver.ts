import { ResolveCurrentPeriodUseCase } from '@/modules/periods/application/use-cases/resolve-current-period';
import { FakePeriodRepository } from './fake-period-repository';
import { FakeSettingRepository } from './fake-setting-repository';

export const buildFakePeriodResolver = () =>
  new ResolveCurrentPeriodUseCase(new FakePeriodRepository(), new FakeSettingRepository());
