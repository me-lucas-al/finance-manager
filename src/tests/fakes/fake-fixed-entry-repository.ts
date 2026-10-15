import { definedOnly } from './defined-only';
import type { FixedEntry } from '../../modules/finance/domain/models/fixed-entry';
import type {
  FixedEntryRepository,
  FixedEntryUpdate,
  NewFixedEntry,
} from '../../modules/finance/domain/repositories/fixed-entry-repository';

export class FakeFixedEntryRepository implements FixedEntryRepository {
  public items: FixedEntry[] = [];
  private counter = 1;

  async create(data: NewFixedEntry): Promise<FixedEntry> {
    const item: FixedEntry = {
      ...data,
      id: `fx-${this.counter++}`,
      lastLaunchedMonth: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.items.push(item);
    return item;
  }

  async findById(userId: string, id: string): Promise<FixedEntry | null> {
    return this.items.find((item) => item.id === id && item.userId === userId) ?? null;
  }

  async findAllByUserId(userId: string): Promise<FixedEntry[]> {
    return this.items.filter((item) => item.userId === userId);
  }

  async findUserIdsWithActiveEntries(): Promise<string[]> {
    return [...new Set(this.items.filter((item) => item.active).map((item) => item.userId))];
  }

  async update(userId: string, id: string, data: FixedEntryUpdate): Promise<FixedEntry> {
    const index = this.items.findIndex((item) => item.id === id && item.userId === userId);
    if (index === -1) throw new Error('Fixed entry not found');
    this.items[index] = { ...this.items[index], ...definedOnly(data), updatedAt: new Date() };
    return this.items[index];
  }

  async markLaunched(userId: string, id: string, month: string): Promise<void> {
    const item = this.items.find((entry) => entry.id === id && entry.userId === userId);
    if (item) item.lastLaunchedMonth = month;
  }

  async delete(userId: string, id: string): Promise<void> {
    this.items = this.items.filter((item) => !(item.id === id && item.userId === userId));
  }
}
