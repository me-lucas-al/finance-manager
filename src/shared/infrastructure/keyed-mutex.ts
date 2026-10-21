export class KeyedMutex {
  private readonly tails = new Map<string, Promise<void>>();

  async acquire(key: string): Promise<() => void> {
    const previous = this.tails.get(key) ?? Promise.resolve();
    let release = () => {};
    const current = new Promise<void>((resolve) => {
      release = resolve;
    });
    const tail = previous.then(() => current);
    this.tails.set(key, tail);
    await previous;
    return () => {
      release();
      if (this.tails.get(key) === tail) this.tails.delete(key);
    };
  }

  async run<T>(key: string, work: () => Promise<T>): Promise<T> {
    const release = await this.acquire(key);
    try {
      return await work();
    } finally {
      release();
    }
  }
}
