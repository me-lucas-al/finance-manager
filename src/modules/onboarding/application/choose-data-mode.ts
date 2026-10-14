export type DataMode = 'manual' | 'pluggy';

export interface DataModeStore {
  getState(userId: string): Promise<{ dataMode: DataMode | null; completed: boolean }>;
  setState(userId: string, dataMode: DataMode, completed: boolean): Promise<void>;
}

export interface FinancialDataResetter {
  disconnectBanks(userId: string): Promise<void>;
  wipeLedger(userId: string): Promise<void>;
}

export type ChooseDataModeResult = { changed: boolean; wiped: boolean };

export class ChooseDataModeUseCase {
  constructor(
    private store: DataModeStore,
    private resetter: FinancialDataResetter,
  ) {}

  async execute(userId: string, mode: DataMode): Promise<ChooseDataModeResult> {
    const current = await this.store.getState(userId);

    if (current.dataMode === mode) {
      return { changed: false, wiped: false };
    }

    const isSwitch = current.dataMode !== null;
    if (isSwitch) {
      if (current.dataMode === 'pluggy') await this.resetter.disconnectBanks(userId);
      await this.resetter.wipeLedger(userId);
    }

    await this.store.setState(userId, mode, false);
    return { changed: true, wiped: isSwitch };
  }
}
