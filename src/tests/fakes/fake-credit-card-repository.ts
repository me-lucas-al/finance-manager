import type { CreditCard } from '@/modules/finance/domain/models/credit-card';
import type {
  CreditCardRepository,
  CreditCardUpdate,
  NewCreditCard,
} from '@/modules/finance/domain/repositories/credit-card-repository';
import { definedOnly } from './defined-only';

export class FakeCreditCardRepository implements CreditCardRepository {
  items: CreditCard[] = [];
  private counter = 1;

  async create(data: NewCreditCard): Promise<CreditCard> {
    const now = new Date('2026-10-01T12:00:00Z');
    const card: CreditCard = { ...data, id: `card-${this.counter++}`, createdAt: now, updatedAt: now };
    this.items.push(card);
    return card;
  }

  async findById(userId: string, id: string): Promise<CreditCard | null> {
    return this.items.find((card) => card.id === id && card.userId === userId) ?? null;
  }

  async findAllByUserId(userId: string): Promise<CreditCard[]> {
    return this.items.filter((card) => card.userId === userId);
  }

  async update(userId: string, id: string, data: CreditCardUpdate): Promise<CreditCard> {
    const index = this.items.findIndex((card) => card.id === id && card.userId === userId);
    if (index === -1) throw new Error('Credit card not found');
    this.items[index] = { ...this.items[index], ...definedOnly(data) };
    return this.items[index];
  }

  async delete(userId: string, id: string): Promise<void> {
    this.items = this.items.filter((card) => !(card.id === id && card.userId === userId));
  }
}
