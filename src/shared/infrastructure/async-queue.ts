export class AsyncQueue<T> implements AsyncIterable<T> {
  private readonly items: T[] = [];
  private waiting: ((result: IteratorResult<T>) => void) | null = null;
  private closed = false;

  push(item: T): void {
    if (this.closed) return;
    if (!this.waiting) {
      this.items.push(item);
      return;
    }
    const resolve = this.waiting;
    this.waiting = null;
    resolve({ value: item, done: false });
  }

  close(): void {
    this.closed = true;
    if (!this.waiting) return;
    const resolve = this.waiting;
    this.waiting = null;
    resolve({ value: undefined, done: true });
  }

  [Symbol.asyncIterator](): AsyncIterator<T> {
    return { next: () => this.next() };
  }

  private next(): Promise<IteratorResult<T>> {
    const item = this.items.shift();
    if (item !== undefined) return Promise.resolve({ value: item, done: false });
    if (this.closed) return Promise.resolve({ value: undefined, done: true });
    return new Promise((resolve) => {
      this.waiting = resolve;
    });
  }
}
