import { describe, it, expect, beforeEach } from 'vitest';
import {
  ChooseDataModeUseCase,
  type DataMode,
  type DataModeStore,
  type FinancialDataResetter,
} from '@/modules/onboarding/application/choose-data-mode';

class FakeStore implements DataModeStore {
  state = new Map<string, { dataMode: DataMode | null; completed: boolean }>();

  async getState(userId: string) {
    return this.state.get(userId) ?? { dataMode: null, completed: false };
  }

  async setState(userId: string, dataMode: DataMode, completed: boolean) {
    this.state.set(userId, { dataMode, completed });
  }

  async complete(userId: string) {
    const current = await this.getState(userId);
    this.state.set(userId, { ...current, completed: true });
  }
}

class FakeResetter implements FinancialDataResetter {
  calls: string[] = [];

  async disconnectBanks(userId: string) {
    this.calls.push(`disconnect:${userId}`);
  }

  async wipeLedger(userId: string) {
    this.calls.push(`wipe:${userId}`);
  }
}

describe('ChooseDataModeUseCase', () => {
  let store: FakeStore;
  let resetter: FakeResetter;
  let useCase: ChooseDataModeUseCase;

  beforeEach(() => {
    store = new FakeStore();
    resetter = new FakeResetter();
    useCase = new ChooseDataModeUseCase(store, resetter);
  });

  it('records the first choice without deleting anything', async () => {
    const result = await useCase.execute('u1', 'manual');

    expect(result).toEqual({ changed: true, wiped: false });
    expect(resetter.calls).toEqual([]);
    expect(await store.getState('u1')).toEqual({ dataMode: 'manual', completed: false });
  });

  it('does nothing when the same mode is chosen again', async () => {
    store.state.set('u1', { dataMode: 'manual', completed: true });

    const result = await useCase.execute('u1', 'manual');

    expect(result).toEqual({ changed: false, wiped: false });
    expect(resetter.calls).toEqual([]);
    expect((await store.getState('u1')).completed).toBe(true);
  });

  it('wipes the ledger and restarts onboarding when leaving manual mode', async () => {
    store.state.set('u1', { dataMode: 'manual', completed: true });

    const result = await useCase.execute('u1', 'pluggy');

    expect(result).toEqual({ changed: true, wiped: true });
    expect(resetter.calls).toEqual(['wipe:u1']);
    expect(await store.getState('u1')).toEqual({ dataMode: 'pluggy', completed: false });
  });

  it('disconnects banks before wiping when leaving pluggy mode', async () => {
    store.state.set('u1', { dataMode: 'pluggy', completed: true });

    await useCase.execute('u1', 'manual');

    expect(resetter.calls).toEqual(['disconnect:u1', 'wipe:u1']);
  });

  it('only touches the requesting user', async () => {
    store.state.set('u1', { dataMode: 'manual', completed: true });
    store.state.set('u2', { dataMode: 'manual', completed: true });

    await useCase.execute('u1', 'pluggy');

    expect(resetter.calls.every((call) => call.endsWith(':u1'))).toBe(true);
    expect(await store.getState('u2')).toEqual({ dataMode: 'manual', completed: true });
  });
});
