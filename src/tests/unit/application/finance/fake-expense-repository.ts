import { Expense, ExpenseRepository } from '../../../../modules/finance/domain/repositories/expense-repository';

export class FakeExpenseRepository implements ExpenseRepository {
  private items: Expense[] = [];
  private idCounter = 1;

  async create(data: Omit<Expense, 'id'>): Promise<Expense> {
    const item = { ...data, id: String(this.idCounter++) } as Expense;
    this.items.push(item);
    return item;
  }
  async findById(id: string): Promise<Expense | null> {
    return this.items.find(i => i.id === id) || null;
  }
  async update(id: string, data: Partial<Expense>): Promise<Expense> {
    const index = this.items.findIndex(i => i.id === id);
    if (index === -1) throw new Error('Not found');
    this.items[index] = { ...this.items[index], ...data };
    return this.items[index];
  }
  async delete(id: string): Promise<void> {
    this.items = this.items.filter(i => i.id !== id);
  }
  
}