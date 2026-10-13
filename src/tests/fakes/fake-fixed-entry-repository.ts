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
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.items.push(item);
    return item;
  }

  async findById(id: string): Promise<FixedEntry | null> {
    return this.items.find((item) => item.id === id) ?? null;
  }

  async findAllByUserId(userId: string): Promise<FixedEntry[]> {
    return this.items.filter((item) => item.userId === userId);
  }

  async update(id: string, data: FixedEntryUpdate): Promise<FixedEntry> {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) throw new Error('Fixed entry not found');
    this.items[index] = { ...this.items[index], ...definedOnly(data), updatedAt: new Date() };
    return this.items[index];
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((item) => item.id !== id);
  }
}
