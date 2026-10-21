import type { DataModeStore } from '@/modules/onboarding/application/choose-data-mode';
import type { DataModeReader } from '../domain/ports/data-mode-reader';

export class StoreDataModeReader implements DataModeReader {
  constructor(private readonly store: Pick<DataModeStore, 'getState'>) {}

  async isManualMode(userId: string): Promise<boolean> {
    const { dataMode } = await this.store.getState(userId);
    return dataMode === 'manual';
  }
}
